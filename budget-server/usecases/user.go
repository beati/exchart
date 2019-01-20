package usecases

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"html/template"
	"io"
	"time"

	"golang.org/x/crypto/bcrypt"

	"bitbucket.org/beati/budget/budget-server/domain"
	"bitbucket.org/beati/budget/budget-server/lib/nonce"
)

// A UserTx interface is used to interact with a persistence solution.
type UserTx interface {
	GetUser(userID domain.EntityID) (*User, error)
	GetUserByEmail(email string) (*User, error)
	AddUser(user *User) error
	UpdateUser(user *User) error
	DeleteUser(userID domain.EntityID) error
}

// A PasswordHash interface is used to hash and verify password.
type PasswordHash interface {
	Hash(password string) (string, error)
	Verify(hash, password string) error
}

// A User represents a user of the application.
type User struct {
	ID                   domain.EntityID `db:"user_id,omitempty"`
	AccountID            domain.EntityID `db:"account_id"`
	Email                string          `db:"email"`
	PasswordHash         string          `db:"password_hash"`
	PasswordResetToken   string          `db:"password_reset_token"`
	EmailVerificationKey string          `db:"email_verification_key"`
	EmailVerified        bool            `db:"email_verified"`
}

// NewUser returns a new user.
func NewUser(email, password string, hash PasswordHash) (*User, error) {
	user := &User{
		Email:                email,
		EmailVerificationKey: nonce.Base64(32),
	}

	err := user.SetPassword(hash, password)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// CheckPassword returns nil if password is correct.
func (user *User) CheckPassword(hash PasswordHash, password string) error {
	return hash.Verify(user.PasswordHash, password)
}

// SetPassword set the password hash of user.
func (user *User) SetPassword(hash PasswordHash, password string) error {
	h, err := hash.Hash(password)
	if err != nil {
		return err
	}

	user.PasswordHash = h

	return nil
}

// EmailValidationToken returns a validation token for email.
func (user *User) EmailValidationToken(email string) (string, error) {
	mac, err := user.signEmail(email)
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(mac), nil
}

// VerifyEmailValidationToken returns nil if token is a valid token for email.
func (user *User) VerifyEmailValidationToken(email, token string) error {
	expectedMAC, err := user.signEmail(email)
	if err != nil {
		return err
	}

	mac, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return domain.ErrBadParameters
	}

	if !hmac.Equal(mac, expectedMAC) {
		return domain.ErrNotAllowed
	}
	return nil
}

func (user *User) signEmail(email string) ([]byte, error) {
	key, err := base64.StdEncoding.DecodeString(user.EmailVerificationKey)
	if err != nil {
		return nil, err
	}

	mac := hmac.New(sha256.New, key)
	_, _ = io.WriteString(mac, email)
	return mac.Sum(nil), nil
}

// A UserInteractor handles usecases related to users.
type UserInteractor struct {
	repo   Repository
	hash   PasswordHash
	clock  domain.Clock
	mailer Mailer
	host   string
}

// NewUserInteractor creates a new UserInteractor.
func NewUserInteractor(repo Repository, hash PasswordHash, clock domain.Clock, mailer Mailer, host string) *UserInteractor {
	return &UserInteractor{
		repo:   repo,
		hash:   hash,
		clock:  clock,
		mailer: mailer,
		host:   host,
	}
}

var validationEmail = template.Must(template.New("validationEmail").Parse(`
<p>Welcome {{.Name}}</p>
<a href="https://{{.Host}}/email?action=validate&id={{.UserID}}&email={{.Email}}&token={{.Token}}">validate</a>
<a href="https://{{.Host}}/email?action=cancel&id={{.UserID}}&token={{.Token}}">cancel</a>
`))

// AddUser adds a new user to the application.
func (interactor *UserInteractor) AddUser(ctx context.Context, email, password string) (err error) {
	if email == "" || password == "" {
		return domain.ErrBadParameters
	}

	user, err := NewUser(email, password, interactor.hash)
	if err != nil {
		return
	}

	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user.AccountID = 0

	err = tx.AddUser(user)
	if err != nil {
		return
	}

	token, err := user.EmailValidationToken(user.Email)
	if err != nil {
		return
	}

	emailData := struct {
		Name   string
		UserID domain.EntityID
		Host   string
		Email  string
		Token  string
	}{
		Name:   "",
		UserID: user.ID,
		Host:   interactor.host,
		Email:  user.Email,
		Token:  token,
	}
	var buffer bytes.Buffer
	err = validationEmail.Execute(&buffer, emailData)
	if err != nil {
		return
	}

	return interactor.mailer.Send(ctx, &Mail{
		To:      []string{user.Email},
		Subject: "Welcome",
		Text:    buffer.String(),
	})
}

// ValidateUserEmail check that email is owned by the user.
func (interactor *UserInteractor) ValidateUserEmail(ctx context.Context, userID domain.EntityID, email, token string) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUser(userID)
	if err != nil {
		return
	}

	err = user.VerifyEmailValidationToken(email, token)
	if err != nil {
		return
	}

	user.Email = email
	user.EmailVerificationKey = nonce.Base64(32)
	user.EmailVerified = true
	return tx.UpdateUser(user)
}

// CancelUserEmail delete an acount from an email validation.
func (interactor *UserInteractor) CancelUserEmail(ctx context.Context, userID domain.EntityID, token string) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUser(userID)
	if err != nil {
		return
	}

	if user.EmailVerified {
		return domain.ErrBadParameters
	}

	err = user.VerifyEmailValidationToken(user.Email, token)
	if err != nil {
		return
	}

	return tx.DeleteUser(userID)
}

var validationChangeEmail = template.Must(template.New("validationChangeEmail").Parse(`
<a href="https://{{.Host}}/email?action=validate&id={{.UserID}}&email={{.Email}}&token={{.Token}}">validate</a>
`))

// ChangeUserEmail sends a new email address to validate it.
func (interactor *UserInteractor) ChangeUserEmail(ctx context.Context, userID domain.EntityID, password, email string) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUser(userID)
	if err != nil {
		return
	}

	err = user.CheckPassword(interactor.hash, password)
	if err != nil {
		return
	}

	token, err := user.EmailValidationToken(email)
	if err != nil {
		return
	}

	emailData := struct {
		UserID domain.EntityID
		Host   string
		Email  string
		Token  string
	}{
		UserID: user.ID,
		Host:   interactor.host,
		Email:  email,
		Token:  token,
	}
	var buffer bytes.Buffer
	err = validationChangeEmail.Execute(&buffer, emailData)
	if err != nil {
		return
	}

	return interactor.mailer.Send(ctx, &Mail{
		To:      []string{email},
		Subject: "Validate your address",
		Text:    buffer.String(),
	})
}

// ChangePassword changes a user password.
func (interactor *UserInteractor) ChangePassword(ctx context.Context, userID domain.EntityID, oldPassword, newPassword string) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUser(userID)
	if err != nil {
		return
	}

	err = user.CheckPassword(interactor.hash, oldPassword)
	if err != nil {
		return
	}

	err = user.SetPassword(interactor.hash, newPassword)
	if err != nil {
		return
	}

	return tx.UpdateUser(user)
}

var passwordResetEmail = template.Must(template.New("passwordResetEmail").Parse(`
<a href="https://{{.Host}}/password?id={{.UserID}}&token={{.Token}}">Reset</a>
`))

// RequestPasswordReset sends am email with reset password infos to a user.
func (interactor *UserInteractor) RequestPasswordReset(ctx context.Context, email string) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUserByEmail(email)
	if err != nil {
		return
	}

	buf := bytes.NewBuffer(make([]byte, 0, 24))
	validity := time.Now().Add(time.Hour).Unix()
	err = binary.Write(buf, binary.BigEndian, validity)
	if err != nil {
		return
	}
	_, err = io.CopyN(buf, rand.Reader, 16)
	if err != nil {
		return
	}

	token := buf.Bytes()
	hashedToken, err := bcrypt.GenerateFromPassword(token, bcrypt.DefaultCost)
	if err != nil {
		return
	}

	user.PasswordResetToken = string(hashedToken)
	err = tx.UpdateUser(user)
	if err != nil {
		return
	}

	emailData := struct {
		UserID domain.EntityID
		Host   string
		Token  string
	}{
		UserID: user.ID,
		Host:   interactor.host,
		Token:  base64.RawURLEncoding.EncodeToString(token),
	}
	var buffer bytes.Buffer
	err = passwordResetEmail.Execute(&buffer, emailData)
	if err != nil {
		return
	}

	return interactor.mailer.Send(ctx, &Mail{
		To:      []string{email},
		Subject: "Password reset",
		Text:    buffer.String(),
	})
}

// ResetPassword reset the password of a user.
func (interactor *UserInteractor) ResetPassword(ctx context.Context, userID domain.EntityID, token, newPassword string) (err error) {
	tokenData, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return
	}

	tokenBuf := bytes.NewBuffer(tokenData)
	var validityUnix int64
	err = binary.Read(tokenBuf, binary.BigEndian, &validityUnix)
	if err != nil {
		return
	}
	validity := time.Unix(validityUnix, 0)

	if time.Now().After(validity) {
		return domain.ErrNotAllowed
	}

	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUser(userID)
	if err != nil {
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordResetToken), tokenData)
	if err != nil {
		return domain.ErrNotAllowed
	}

	user.PasswordResetToken = ""
	err = user.SetPassword(interactor.hash, newPassword)
	if err != nil {
		return
	}

	return tx.UpdateUser(user)
}

// DeleteUser deletes a user from the application.
func (interactor *UserInteractor) DeleteUser(ctx context.Context, userID domain.EntityID) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	return tx.DeleteUser(userID)
}

// ErrBadCredentials is returned by login when bad credentials are provided.
var ErrBadCredentials = errors.New("bad credentials")

// Authenticate returns the User corresponding to email if password is correct.
func (interactor *UserInteractor) Authenticate(ctx context.Context, email string, password string) (user *User, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err = tx.GetUserByEmail(email)
	if err != nil {
		return
	}

	err = user.CheckPassword(interactor.hash, password)
	if err != nil {
		return
	}

	return user, nil
}
