package session

import (
	"errors"
	"net/http"
	"time"

	"bitbucket.org/beati/budget/budget-server/lib/nonce"
)

// ErrNotFound is returned when no session is found.
var ErrNotFound = errors.New("session not found")

// A Session represents a session.
type Session struct {
	CreationTime time.Time
	Value        interface{}
}

// Expired returns true is the session is expired.
func (s *Session) Expired(validity time.Duration) bool {
	return time.Since(s.CreationTime) > validity
}

// A Persistor interface is used to persist sessions between request.
type Persistor interface {
	Get(id string, session *Session) error
	Save(id string, session *Session) error
	Delete(id string) error
	DeleteExpired(validity time.Duration) error
}

// A Manager is used to handles sessions in an application.
type Manager struct {
	name      string
	validity  time.Duration
	persistor Persistor
}

// NewManager creates a new Manager.
func NewManager(name string, validity time.Duration, persistor Persistor) *Manager {
	m := &Manager{
		name:      name,
		validity:  validity,
		persistor: persistor,
	}

	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		for {
			<-ticker.C
			m.deleteExpired()
		}
	}()

	return m
}

// New creates a new session with v as data.
func (m *Manager) New(w http.ResponseWriter, v interface{}) error {
	id := CreateID()
	err := m.persistor.Save(id, &Session{
		CreationTime: time.Now(),
		Value:        v,
	})
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     m.name,
		Value:    id,
		Path:     "/",
		MaxAge:   m.MaxAge(),
		Secure:   true,
		HttpOnly: true,
	})

	return nil
}

// Clear clears a session.
func (m *Manager) Clear(w http.ResponseWriter, r *http.Request) error {
	cookie, err := r.Cookie(m.name)
	if err != nil {
		return nil
	}
	id := cookie.Value

	err = m.persistor.Delete(id)
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     m.name,
		Value:    "cleared",
		Path:     "/",
		MaxAge:   -1,
		Secure:   true,
		HttpOnly: true,
	})

	return nil
}

// Get retrieve session data in v.
func (m *Manager) Get(r *http.Request, v interface{}) error {
	cookie, err := r.Cookie(m.name)
	if err != nil {
		return ErrNotFound
	}
	id := cookie.Value

	session := &Session{Value: v}
	return m.persistor.Get(id, session)
}

// deleteExpired deletes all expired session from the store.
func (m *Manager) deleteExpired() error {
	return m.persistor.DeleteExpired(m.validity)
}

// MaxAge returns the Max-Age attribute of session cookie set by the Manager.
func (m *Manager) MaxAge() int {
	return int(m.validity / time.Second)
}

// CreateID creates a new 256 bits long secure random ID.
func CreateID() string {
	return nonce.Nonce(32)
}
