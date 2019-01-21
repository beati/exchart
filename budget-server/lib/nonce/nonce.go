package nonce

import (
	"crypto/rand"
	"encoding/base64"
)

// Key returns size random bytes.
func Key(size int) ([]byte, error) {
	b := make([]byte, size)
	_, err := rand.Read(b)
	return b, err
}

// Nonce returns size random bytes encoded as a string usable in URLs and cookies.
func Nonce(size int) (string, error) {
	b, err := Key(size)
	if err != nil {
		return "", err
	}
	return base64.RawStdEncoding.EncodeToString(b), nil
}

// Base64 returns size random bytes base64 encoded.
func Base64(size int) (string, error) {
	b, err := Key(size)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(b), nil
}
