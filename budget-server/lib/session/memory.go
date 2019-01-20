package session

import (
	"reflect"
	"sync"
	"time"
)

// MemoryPersistor implements Persistor with memory backend.
type MemoryPersistor struct {
	mu       sync.RWMutex
	sessions map[string]*Session
}

// NewMemoryPersistor creates a new MemoryPersistor.
func NewMemoryPersistor() *MemoryPersistor {
	return &MemoryPersistor{
		sessions: make(map[string]*Session),
	}
}

// Get implement Persistor.
func (p *MemoryPersistor) Get(id string, session *Session) error {
	p.mu.RLock()
	s, ok := p.sessions[id]
	p.mu.RUnlock()
	if !ok {
		return ErrNotFound
	}
	session.CreationTime = s.CreationTime
	sv := reflect.ValueOf(s.Value).Elem()
	reflect.ValueOf(session.Value).Elem().Set(sv)
	return nil
}

// Save implement Persistor.
func (p *MemoryPersistor) Save(id string, session *Session) error {
	p.mu.Lock()
	p.sessions[id] = session
	p.mu.Unlock()
	return nil
}

// Delete implement Persistor.
func (p *MemoryPersistor) Delete(id string) error {
	p.mu.Lock()
	delete(p.sessions, id)
	p.mu.Unlock()
	return nil
}

// DeleteExpired implement Persistor.
func (p *MemoryPersistor) DeleteExpired(validity time.Duration) error {
	p.mu.Lock()
	for id, s := range p.sessions {
		if s.Expired(validity) {
			delete(p.sessions, id)
		}
	}
	p.mu.Unlock()

	return nil
}
