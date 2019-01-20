package domain

import (
	"crypto/cipher"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"strconv"

	"golang.org/x/crypto/blowfish"
)

// EntityID represents the id of a database entity. It can be obfuscated when transmited
// to client.
type EntityID uint64

const base = 16

// ParseEntityID creates an EntityID from its string representation.
func ParseEntityID(id string) (EntityID, error) {
	obfuscatedID, err := strconv.ParseUint(id, base, 64)
	if err != nil {
		return 0, err
	}
	return deobfuscateID(obfuscatedID), nil
}

// String returns the string representation of id.
func (id EntityID) String() string {
	obfuscatedID := obfuscateID(id)
	return strconv.FormatUint(obfuscatedID, base)
}

// MarshalJSON returns the json representation of id.
func (id *EntityID) MarshalJSON() ([]byte, error) {
	if *id == 0 {
		return []byte("null"), nil
	}

	obfuscatedID := obfuscateID(*id)
	data := []byte{'"'}
	data = strconv.AppendUint(data, obfuscatedID, base)
	return append(data, '"'), nil
}

// UnmarshalJSON set id from its json representation.
func (id *EntityID) UnmarshalJSON(data []byte) error {
	if len(data) <= 2 {
		return errors.New("invalid entity id format")
	}
	if data[0] != '"' || data[len(data)-1] != '"' {
		return errors.New("invalid entity id format")
	}

	var err error
	*id, err = ParseEntityID(string(data[1 : len(data)-1]))
	return err
}

var obfuscationCipher cipher.Block

// InitIDObfuscation set the obfuscation key for id obfuscation.
func InitIDObfuscation(idObfuscationKey string) error {
	key, err := base64.StdEncoding.DecodeString(idObfuscationKey)
	if err != nil {
		return err
	}

	obfuscationCipher, err = blowfish.NewCipher(key)
	return err
}

const idSize = 8

func obfuscateID(id EntityID) uint64 {
	var idBytes [idSize]byte
	binary.BigEndian.PutUint64(idBytes[:], uint64(id))
	obfuscationCipher.Encrypt(idBytes[:], idBytes[:])
	return binary.BigEndian.Uint64(idBytes[:])
}

func deobfuscateID(id uint64) EntityID {
	var idBytes [idSize]byte
	binary.BigEndian.PutUint64(idBytes[:], id)
	obfuscationCipher.Decrypt(idBytes[:], idBytes[:])
	return EntityID(binary.BigEndian.Uint64(idBytes[:]))
}
