package usecases

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha512"
	"encoding/base64"
	"encoding/binary"
	"errors"
	"html/template"
	"io"
	"time"

	"golang.org/x/crypto/bcrypt"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// A User represents a user of the application.
type User struct {
	ID                 domain.EntityID `db:"user_id,omitempty"`
	AccountID          domain.EntityID `db:"account_id"`
	Email              string          `db:"email"`
	PasswordHash       string          `db:"password_hash"`
	PasswordResetToken string          `db:"password_reset_token"`
	ChangeEmailToken   string          `db:"change_email_token"`
	EmailVerified      bool            `db:"email_verified"`
}

// A UserTx interface is used to interact with a persistence solution.
type UserTx interface {
	GetUser(userID domain.EntityID) (*User, error)
	GetUserByEmail(email string) (*User, error)
	AddUser(user *User) error
	UpdateUser(user *User) error
	DeleteUser(userID domain.EntityID) error
}

// NewUser returns a new user.
func NewUser(email, password string, hash PasswordHash) (*User, error) {
	if email == "" || password == "" {
		return nil, domain.ErrBadParameters
	}

	user := &User{
		Email: email,
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

const tokenSecretSize = 16

// SetPasswordResetToken returns a token for password reset.
func (user *User) SetPasswordResetToken() (string, error) {
	buf := bytes.NewBuffer(make([]byte, 0, 8+tokenSecretSize))
	validity := time.Now().Add(time.Hour).Unix()
	err := binary.Write(buf, binary.BigEndian, validity)
	if err != nil {
		return "", err
	}
	_, err = io.CopyN(buf, rand.Reader, 16)
	if err != nil {
		return "", err
	}

	token := buf.Bytes()
	expanded := sha512.Sum512(token)
	hashedToken, err := bcrypt.GenerateFromPassword(expanded[:], bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	user.PasswordResetToken = string(hashedToken)
	return base64.RawURLEncoding.EncodeToString(token), nil
}

// VerifyPasswordResetToken returns nil if token is valid.
func (user *User) VerifyPasswordResetToken(token string) error {
	tokenData, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return domain.ErrBadParameters
	}

	tokenBuf := bytes.NewBuffer(tokenData)
	var validityUnix int64
	err = binary.Read(tokenBuf, binary.BigEndian, &validityUnix)
	if err != nil {
		return domain.ErrBadParameters
	}
	validity := time.Unix(validityUnix, 0)

	if time.Now().After(validity) {
		return domain.ErrNotAllowed
	}

	expanded := sha512.Sum512(tokenData)
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordResetToken), expanded[:])
	if err != nil {
		return domain.ErrNotAllowed
	}
	return nil
}

// SetChangeEmailToken returns a validation token for email.
func (user *User) SetChangeEmailToken(email string) (string, error) {
	buf := bytes.NewBuffer(make([]byte, 0, len(email)+tokenSecretSize))
	_, err := io.WriteString(buf, email)
	if err != nil {
		return "", err
	}
	_, err = io.CopyN(buf, rand.Reader, tokenSecretSize)
	if err != nil {
		return "", err
	}

	token := buf.Bytes()
	expanded := sha512.Sum512(token)
	hashedToken, err := bcrypt.GenerateFromPassword(expanded[:], bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	user.ChangeEmailToken = string(hashedToken)
	return base64.RawURLEncoding.EncodeToString(token), nil
}

// VerifyChangeEmailToken returns the email contained in token if it is valid.
func (user *User) VerifyChangeEmailToken(token string) (string, error) {
	tokenData, err := base64.RawURLEncoding.DecodeString(token)
	if err != nil {
		return "", domain.ErrBadParameters
	}

	email := string(tokenData[tokenSecretSize:])

	expanded := sha512.Sum512(tokenData)
	err = bcrypt.CompareHashAndPassword([]byte(user.ChangeEmailToken), expanded[:])
	if err != nil {
		return "", domain.ErrNotAllowed
	}
	return email, nil
}

// A UserInteractor handles usecases related to users.
type UserInteractor struct {
	repo   Repository
	hash   PasswordHash
	mailer Mailer
	host   string
}

// NewUserInteractor returns a new UserInteractor.
func NewUserInteractor(repo Repository, hash PasswordHash, mailer Mailer, host string) *UserInteractor {
	return &UserInteractor{
		repo:   repo,
		hash:   hash,
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
func (interactor *UserInteractor) AddUser(ctx context.Context, email, password, name string) (err error) {
	account, err := domain.NewAccount(name)
	if err != nil {
		return
	}

	user, err := NewUser(email, password, interactor.hash)
	if err != nil {
		return
	}

	changeEmailToken, err := user.SetChangeEmailToken(user.Email)
	if err != nil {
		return
	}

	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	err = tx.AddAccount(account)
	if err != nil {
		return
	}

	budget := domain.NewMainBudget(account.ID)
	err = tx.AddBudget(budget)
	if err != nil {
		return
	}

	user.AccountID = account.ID

	err = tx.AddUser(user)
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
		Name:   account.Name,
		UserID: user.ID,
		Host:   interactor.host,
		Email:  user.Email,
		Token:  changeEmailToken,
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

// VerifyUserEmail check that email is owned by the user.
func (interactor *UserInteractor) VerifyUserEmail(ctx context.Context, userID domain.EntityID, token string) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUser(userID)
	if err != nil {
		return
	}

	email, err := user.VerifyChangeEmailToken(token)
	if err != nil {
		return
	}

	user.ChangeEmailToken = ""
	user.Email = email
	user.EmailVerified = true
	return tx.UpdateUser(user)
}

// CancelUserEmail delete an account from an email validation.
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
		return domain.ErrNotAllowed
	}

	_, err = user.VerifyChangeEmailToken(token)
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

	token, err := user.SetChangeEmailToken(email)
	if err != nil {
		return
	}

	err = tx.UpdateUser(user)
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

// RequestPasswordReset sends an email with reset password infos to a user.
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

	token, err := user.SetPasswordResetToken()

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
		Token:  token,
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
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	user, err := tx.GetUser(userID)
	if err != nil {
		return
	}

	err = user.VerifyPasswordResetToken(token)
	if err != nil {
		return
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
