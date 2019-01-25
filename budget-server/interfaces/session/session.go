package session

import (
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
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
	maxAge   int
	keyStore KeyStore
}

// NewManager creates a new Manager.
func NewManager(domain, name string, validity time.Duration, keyStore KeyStore) *Manager {
	return &Manager{
		domain:   domain,
		name:     name,
		maxAge:   int(validity / time.Second),
		keyStore: keyStore,
	}
}

// New creates a new session with v as data.
func (m *Manager) New(userID domain.EntityID, w http.ResponseWriter, v interface{}) error {
	userKey, err := m.keyStore.Get(userID)
	if err != nil {
		return err
	}

	if userKey == nil {
		userKey, err = nonce.Nonce(32)
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
		MaxAge:   m.maxAge,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})

	xsrfToken, err := nonce.URL(32)
	if err != nil {
		return err
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "XSRF-TOKEN",
		Value:    xsrfToken,
		Path:     "/",
		Domain:   m.domain,
		MaxAge:   m.maxAge,
		Secure:   true,
		HttpOnly: false,
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

	http.SetCookie(w, &http.Cookie{
		Name:     "XSRF-TOKEN",
		Value:    "cleared",
		Path:     "/",
		Domain:   m.domain,
		MaxAge:   -1,
		Secure:   true,
		HttpOnly: false,
		SameSite: http.SameSiteStrictMode,
	})

	return nil
}

// Get retrieve session data in v.
func (m *Manager) Get(r *http.Request, v interface{}) (domain.EntityID, error) {
	err := checkXSRFToken(r)
	if err != nil {
		return 0, domain.ErrNotAllowed
	}

	cookie, err := r.Cookie(m.name)
	if err != nil {
		return 0, domain.ErrNotAllowed
	}

	values := strings.SplitN(cookie.Value, ":", 2)
	if len(values) != 2 {
		return 0, domain.ErrNotAllowed
	}

	userID, err := domain.ParseEntityID(values[0])
	if err != nil {
		return 0, domain.ErrNotAllowed
	}

	userKey, err := m.keyStore.Get(userID)
	if err != nil {
		return 0, err
	}

	if userKey == nil {
		return 0, domain.ErrNotAllowed
	}

	s := &session{
		Value: v,
	}
	err = s.decode(userKey, values[1], userID)
	if err != nil {
		return 0, err
	}

	return userID, nil
}

func checkXSRFToken(r *http.Request) error {
	if r.Method != "GET" && r.Method != "HEAD" {
		csrfCookie, err := r.Cookie("XSRF-TOKEN")
		if err != nil {
			return domain.ErrNotAllowed
		}
		if subtle.ConstantTimeCompare([]byte(csrfCookie.Value), []byte(r.Header.Get("X-XSRF-TOKEN"))) != 1 {
			return domain.ErrNotAllowed
		}
	}
	return nil
}

// Revoke change the encryption key of a user. This invalidate previsously created sessions.
func (m *Manager) Revoke(userID domain.EntityID) error {
	userKey, err := nonce.Nonce(32)
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
		return domain.ErrNotAllowed
	}

	aead, err := chacha20poly1305.NewX(key)
	if err != nil {
		return err
	}

	userIDBytes := userID.Bytes()
	plaintext, err := aead.Open(nil, ciphertext[:aead.NonceSize()], ciphertext[aead.NonceSize():], userIDBytes[:])
	if err != nil {
		return domain.ErrNotAllowed
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

	n, err := nonce.Nonce(aead.NonceSize())
	if err != nil {
		return "", err
	}

	userIDBytes := userID.Bytes()
	ciphertext := aead.Seal(plaintext[:0], n, plaintext, userIDBytes[:])

	return base64.RawURLEncoding.EncodeToString(append(n, ciphertext...)), nil
}
