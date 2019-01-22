package nonce

import (
	"crypto/rand"
	"encoding/base64"
)

// Read fills b with random bytes.
func Read(b []byte) error {
	_, err := rand.Read(b)
	return err
}

// Nonce returns size random bytes.
func Nonce(size int) ([]byte, error) {
	b := make([]byte, size)
	_, err := rand.Read(b)
	return b, err
}

// URL returns size random bytes encoded as a string usable in URLs and cookies.
func URL(size int) (string, error) {
	b, err := Nonce(size)
	if err != nil {
		return "", err
	}
	return base64.RawStdEncoding.EncodeToString(b), nil
}

// Base64 returns size random bytes base64 encoded.
func Base64(size int) (string, error) {
	b, err := Nonce(size)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}
