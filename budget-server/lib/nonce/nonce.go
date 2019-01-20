package nonce

import (
	"crypto/rand"
	"encoding/base64"
	"io"
)

var encoder = base64.URLEncoding.WithPadding('#')

// Nonce return size random bytes encoded as a string usable in URLs and cookies.
func Nonce(size int) string {
	return encoder.EncodeToString(nonce(size))
}

// Base64 return size random bytes base64 encoded.
func Base64(size int) string {
	return base64.StdEncoding.EncodeToString(nonce(size))
}

func nonce(size int) []byte {
	b := make([]byte, size)
	_, err := io.ReadFull(rand.Reader, b)
	if err != nil {
		panic(err)
	}
	return b
}
