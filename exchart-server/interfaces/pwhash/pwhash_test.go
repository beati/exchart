package pwhash

import "testing"
import "encoding/base64"
import "golang.org/x/crypto/bcrypt"

type hashTest struct {
	hashedPassword   string
	verifiedPassword string
	err              bool
}

var hashtests = []hashTest{
	{"password", "password", false},
	{"password", "badpassword", true},
}

func TestHash(t *testing.T) {
	keyBytes := make([]byte, 32)
	key := base64.StdEncoding.EncodeToString(keyBytes)
	pwh, err := New(key)
	if err != nil {
		t.Fatal(err)
	}

	for _, test := range hashtests {
		hash, err := pwh.Hash(test.hashedPassword)
		if err != nil {
			t.Error(err)
			continue
		}

		err = pwh.Verify(hash, test.verifiedPassword)
		if (err != nil) != test.err {
			t.Errorf("verification failed")
		}
	}
}

func BenchmarkHash(b *testing.B) {
	keyBytes := make([]byte, 32)
	key := base64.StdEncoding.EncodeToString(keyBytes)
	pwh, err := New(key)
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_, _ = pwh.Hash("password")
	}
}

func BenchmarkVerifyRight(b *testing.B) {
	keyBytes := make([]byte, 32)
	key := base64.StdEncoding.EncodeToString(keyBytes)
	pwh, err := New(key)
	if err != nil {
		b.Fatal(err)
	}

	hash, err := pwh.Hash("password")
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_ = pwh.Verify(hash, "password")
	}
}

func BenchmarkVerifyWrong(b *testing.B) {
	keyBytes := make([]byte, 32)
	key := base64.StdEncoding.EncodeToString(keyBytes)
	pwh, err := New(key)
	if err != nil {
		b.Fatal(err)
	}

	hash, err := pwh.Hash("password")
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_ = pwh.Verify(hash, "badpasswd")
	}
}

func benchmarkBcryptHash(cost int, b *testing.B) {
	password := []byte("password")

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_, _ = bcrypt.GenerateFromPassword(password, cost)
	}
}

func benchmarkBcryptVerify(cost int, b *testing.B) {
	password := []byte("password")
	hash, err := bcrypt.GenerateFromPassword(password, cost)
	if err != nil {
		b.Fatal(err)
	}

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_ = bcrypt.CompareHashAndPassword(hash, password)
	}
}

func BenchmarkBcryptHashDefaultCost(b *testing.B) {
	benchmarkBcryptHash(bcrypt.DefaultCost, b)
}

func BenchmarkBcryptVerifyDefaultCost(b *testing.B) {
	benchmarkBcryptVerify(bcrypt.DefaultCost, b)
}

func BenchmarkBcryptHashDefaultCostPlus1(b *testing.B) {
	benchmarkBcryptHash(bcrypt.DefaultCost+1, b)
}

func BenchmarkBcryptVerifyDefaultCostPlus1(b *testing.B) {
	benchmarkBcryptVerify(bcrypt.DefaultCost+1, b)
}
