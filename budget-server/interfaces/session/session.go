package session

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/chacha20poly1305"

	"bitbucket.org/beati/budget/budget-server/domain"
	"bitbucket.org/beati/budget/budget-server/lib/nonce"
)

// A KeyStore interface is used by a Manager to store user encryption keys.
type KeyStore interface {
	Get(userID domain.EntityID) ([]byte, error)
	Set(userID domain.EntityID, key []byte) error
	Delete(userID domain.EntityID) error
}

// A Manager is used to handles sessions in an application.
type Manager struct {
	domain   string
	name     string
	validity time.Duration
	keyStore KeyStore
}

// NewManager creates a new Manager.
func NewManager(domain, name string, validity time.Duration, keyStore KeyStore) *Manager {
	return &Manager{
		domain:   domain,
		name:     name,
		validity: validity,
		keyStore: keyStore,
	}
}

// MaxAge returns the Max-Age attribute of session cookie set by the Manager.
func (m *Manager) MaxAge() int {
	return int(m.validity / time.Second)
}

// New creates a new session with v as data.
func (m *Manager) New(userID domain.EntityID, w http.ResponseWriter, v interface{}) error {
	userKey, err := m.keyStore.Get(userID)
	if err != nil {
		return err
	}

	if userKey == nil {
		userKey, err = nonce.Key(32)
		if err != nil {
			return err
		}

		err = m.keyStore.Set(userID, userKey)
		if err != nil {
			return err
		}
	}

	s := newSession(v)
	cookieValue, err := s.encode(userKey, userID)
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     m.name,
		Value:    userID.String() + ":" + cookieValue,
		Path:     "/",
		Domain:   m.domain,
		MaxAge:   m.MaxAge(),
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})

	return nil
}

// Clear clears a session.
func (m *Manager) Clear(w http.ResponseWriter) error {
	http.SetCookie(w, &http.Cookie{
		Name:     m.name,
		Value:    "cleared",
		Path:     "/",
		Domain:   m.domain,
		MaxAge:   -1,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})

	return nil
}

// Get retrieve session data in v.
func (m *Manager) Get(r *http.Request, v interface{}) (domain.EntityID, error) {
	cookie, err := r.Cookie(m.name)
	if err != nil {
		return 0, err
	}

	values := strings.SplitN(cookie.Value, ":", 2)
	if len(values) != 2 {
		return 0, errors.New("invalid session")
	}

	userID, err := domain.ParseEntityID(values[0])
	if err != nil {
		return 0, err
	}

	userKey, err := m.keyStore.Get(userID)
	if err != nil {
		return 0, err
	}

	s := &session{
		Value: v,
	}
	s.decode(userKey, values[1], userID)

	return userID, nil
}

// Revoke change the encryption key of a user. This invalidate previsously created sessions.
func (m *Manager) Revoke(userID domain.EntityID) error {
	userKey, err := nonce.Key(32)
	if err != nil {
		return err
	}

	return m.keyStore.Set(userID, userKey)
}

// Delete deletes a user from the Manager.
func (m *Manager) Delete(userID domain.EntityID) error {
	return m.keyStore.Delete(userID)
}

type session struct {
	CreationTime time.Time
	Value        interface{}
}

func newSession(value interface{}) *session {
	return &session{
		CreationTime: time.Now(),
		Value:        value,
	}
}

func (s *session) decode(key []byte, data string, userID domain.EntityID) error {
	ciphertext, err := base64.RawURLEncoding.DecodeString(data)
	if err != nil {
		return err
	}

	aead, err := chacha20poly1305.NewX(key)
	if err != nil {
		return err
	}

	userIDBytes := userID.Bytes()
	plaintext, err := aead.Open(nil, ciphertext[:aead.NonceSize()], ciphertext[aead.NonceSize():], userIDBytes[:])
	if err != nil {
		return err
	}

	return json.Unmarshal(plaintext, s)
}

func (s *session) encode(key []byte, userID domain.EntityID) (string, error) {
	plaintext, err := json.Marshal(s)
	if err != nil {
		return "", err
	}

	aead, err := chacha20poly1305.NewX(key)
	if err != nil {
		return "", err
	}

	n, err := nonce.Key(aead.NonceSize())
	if err != nil {
		return "", err
	}

	userIDBytes := userID.Bytes()
	ciphertext := aead.Seal(plaintext[:0], n, plaintext, userIDBytes[:])

	return base64.RawURLEncoding.EncodeToString(append(n, ciphertext...)), nil
}
