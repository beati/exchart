package pwhash

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"errors"
	"io"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/crypto/hkdf"

	"bitbucket.org/beati/budget/budget-server/usecases"
)

// Hash is an implementation of usecases.PasswordHash.
type Hash struct {
	hmacKey []byte
	block   cipher.Block
}

// New returns a new Hash.
func New(pwHashEncryptionKey string) (Hash, error) {
	key, err := base64.StdEncoding.DecodeString(pwHashEncryptionKey)
	if err != nil {
		return Hash{}, err
	}

	hkdf := hkdf.New(sha256.New, key, nil, nil)

	hmacKey := make([]byte, 32)
	_, err = io.ReadFull(hkdf, hmacKey)
	if err != nil {
		return Hash{}, err
	}

	encryptionKey := make([]byte, 32)
	_, err = io.ReadFull(hkdf, encryptionKey)
	if err != nil {
		return Hash{}, err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return Hash{}, err
	}

	return Hash{
		hmacKey: hmacKey,
		block:   block,
	}, nil
}

const (
	bcryptSize        = 60
	cipherTextSize    = 64
	authenticatedSize = aes.BlockSize + cipherTextSize
)

// Hash implements usescases.PasswordHash.
func (pwh Hash) Hash(password string) (string, error) {
	expanded := sha512.Sum512([]byte(password))

	hash, err := bcrypt.GenerateFromPassword(expanded[:], bcrypt.DefaultCost+1)
	if err != nil {
		return "", err
	}

	if len(hash) != bcryptSize {
		return "", errors.New("bad bcrypt hash size")
	}

	mac := hmac.New(sha256.New, pwh.hmacKey)

	data := make([]byte, authenticatedSize, authenticatedSize+mac.Size())

	iv := data[:aes.BlockSize]
	_, err = io.ReadFull(rand.Reader, iv)
	if err != nil {
		return "", err
	}

	plaintext := data[aes.BlockSize:authenticatedSize]
	copy(plaintext, hash)
	mode := cipher.NewCBCEncrypter(pwh.block, iv)
	mode.CryptBlocks(plaintext, plaintext)

	_, _ = mac.Write(data[:authenticatedSize])
	data = mac.Sum(data)

	return base64.StdEncoding.EncodeToString(data), nil
}

// Verify implements usescases.PasswordHash.
func (pwh Hash) Verify(hash, password string) error {
	data, err := base64.StdEncoding.DecodeString(hash)
	if err != nil {
		return err
	}

	mac := hmac.New(sha256.New, pwh.hmacKey)
	if len(data) < authenticatedSize+mac.Size() {
		return errors.New("password hash to short")
	}
	_, _ = mac.Write(data[:authenticatedSize])
	expectedMac := mac.Sum(nil)

	if !hmac.Equal(expectedMac, data[authenticatedSize:]) {
		return usecases.ErrBadCredentials
	}

	iv := data[:aes.BlockSize]
	ciphertext := data[aes.BlockSize:authenticatedSize]
	mode := cipher.NewCBCDecrypter(pwh.block, iv)
	mode.CryptBlocks(ciphertext, ciphertext)

	expanded := sha512.Sum512([]byte(password))

	err = bcrypt.CompareHashAndPassword(ciphertext[:bcryptSize], expanded[:])
	if err != nil {
		return usecases.ErrBadCredentials
	}
	return nil
}
