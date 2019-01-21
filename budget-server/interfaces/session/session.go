package session

import (
	"encoding/json"
	"net/http"
	"time"

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
	cookieValue, err := s.encode(userKey)
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
func (m *Manager) Get(r *http.Request, v interface{}) error {
	/*
		cookie, err := r.Cookie(m.name)
		if err != nil {
			return ErrNotFound
		}
	*/

	return nil
}

// Revoke change the encryption key of a user. This invalidate previsously created sessions.
func (m *Manager) Revoke(userID domain.EntityID) error {
	userKey, err := nonce.Key(32)
	if err != nil {
		return err
	}

	return m.keyStore.Set(userID, userKey)
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

func (s *session) encode(key []byte) (string, error) {
	data, err := json.Marshal(s)
	if err != nil {
		return "", err
	}

	return "", nil
}
