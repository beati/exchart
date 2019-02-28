package domain

import "errors"

// Errors returned by functions of the package.
var (
	ErrAlreadyExists = errors.New("already exists")
	ErrBadParameters = errors.New("bad parameters")
	ErrNotAllowed    = errors.New("not allowed")
	ErrNotFound      = errors.New("not found")
)
