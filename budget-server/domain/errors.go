package domain

import "errors"

// Errors returned by functions of the package.
var (
	ErrBadParameters = errors.New("bad parameters")
	ErrNotAllowed    = errors.New("not allowed")
	ErrAlreadyExists = errors.New("already exists")
)
