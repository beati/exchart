package usecases

// A PasswordHash interface is used to hash and verify password.
type PasswordHash interface {
	Hash(password string) (string, error)
	Verify(hash, password string) error
}
