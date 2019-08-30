package domain

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"encoding/binary"
	"errors"
)

// EntityID represents the id of a database entity. It can be obfuscated when transmited
// to client.
type EntityID uint64

const size = 8
const obfuscatedSize = aes.BlockSize

// ParseEntityID creates an EntityID from its string representation.
func ParseEntityID(id string) (EntityID, error) {
	var obfuscatedID [obfuscatedSize]byte
	n, err := base64.RawURLEncoding.Decode(obfuscatedID[:], []byte(id))
	if err != nil {
		return 0, err
	}
	if n != obfuscatedSize {
		return 0, errors.New("invalid obfuscated id size")
	}
	return unobfuscateID(obfuscatedID), nil
}

// String returns the obfuscated string representation of id.
func (id EntityID) String() string {
	obfuscatedID := obfuscateID(id)
	return base64.RawURLEncoding.EncodeToString(obfuscatedID[:])
}

// MarshalJSON returns the obfuscated json representation of id.
func (id EntityID) MarshalJSON() ([]byte, error) {
	obfuscatedID := id.String()
	data := make([]byte, 0, len(obfuscatedID)+2)
	data = append(data, '"')
	data = append(data, obfuscatedID...)
	return append(data, '"'), nil
}

// UnmarshalJSON sets id from its obfuscated json representation.
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

// Bytes returns the byte representation of id.
func (id EntityID) Bytes() [size]byte {
	var byteID [size]byte
	binary.BigEndian.PutUint64(byteID[:], uint64(id))
	return byteID
}

// Scan implements sql.Scanner.
func (id *EntityID) Scan(src interface{}) error {
	switch v := src.(type) {
	case nil:
		*id = 0
	case int64:
		*id = EntityID(v)
	default:
		return errors.New("invalid entity id type")
	}
	return nil
}

var obfuscationCipher cipher.Block

// InitIDObfuscation set the obfuscation key for id obfuscation.
func InitIDObfuscation(idObfuscationKey string) error {
	key, err := base64.StdEncoding.DecodeString(idObfuscationKey)
	if err != nil {
		return err
	}

	obfuscationCipher, err = aes.NewCipher(key)
	return err
}

func obfuscateID(id EntityID) [obfuscatedSize]byte {
	var obfuscatedID [obfuscatedSize]byte
	binary.BigEndian.PutUint64(obfuscatedID[:], uint64(id))
	obfuscationCipher.Encrypt(obfuscatedID[:], obfuscatedID[:])
	return obfuscatedID
}

func unobfuscateID(obfuscatedID [obfuscatedSize]byte) EntityID {
	obfuscationCipher.Decrypt(obfuscatedID[:], obfuscatedID[:])
	return EntityID(binary.BigEndian.Uint64(obfuscatedID[:]))
}
