package session

import (
	"bytes"
	"encoding/json"
	"os/user"
	"time"

	"github.com/boltdb/bolt"
)

// BoltPersistor implements Persistor with boltdb backend.
type BoltPersistor struct {
	db *bolt.DB
}

var sessions = []byte("sessions")

// NewBoltPersistor creates a new BoltPersistor.
func NewBoltPersistor(path string) (*BoltPersistor, error) {
	if path == "" {
		u, err := user.Current()
		if err != nil {
			return nil, err
		}
		path = u.HomeDir + "/sessions"
	}

	db, err := bolt.Open(path, 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}

	err = db.Update(func(tx *bolt.Tx) error {
		_, err = tx.CreateBucketIfNotExists(sessions)
		return err
	})
	if err != nil {
		_ = db.Close()
		return nil, err
	}

	return &BoltPersistor{db: db}, nil
}

// Get implement Persistor.
func (p *BoltPersistor) Get(id string, session *Session) error {
	var b bytes.Buffer
	err := p.db.View(func(tx *bolt.Tx) error {
		v := tx.Bucket(sessions).Get([]byte(id))
		if v == nil {
			return ErrNotFound
		}
		b.Write(v)
		return nil
	})
	if err != nil {
		return err
	}

	return json.NewDecoder(&b).Decode(session)
}

// Save implement Persistor.
func (p *BoltPersistor) Save(id string, session *Session) error {
	value, err := json.Marshal(session)
	if err != nil {
		return err
	}

	return p.db.Update(func(tx *bolt.Tx) error {
		return tx.Bucket(sessions).Put([]byte(id), value)
	})
}

// Delete implement Persistor.
func (p *BoltPersistor) Delete(id string) error {
	return p.db.Update(func(tx *bolt.Tx) error {
		return tx.Bucket(sessions).Delete([]byte(id))
	})
}

// DeleteExpired implement Persistor.
func (p *BoltPersistor) DeleteExpired(validity time.Duration) error {
	toDelete := [][]byte{}
	err := p.db.View(func(tx *bolt.Tx) error {
		return tx.Bucket(sessions).ForEach(func(k, v []byte) error {
			s := Session{}
			err := json.Unmarshal(v, &s)
			if err != nil {
				return err
			}

			if s.Expired(validity) {
				toDelete = append(toDelete, k)
			}
			return nil
		})
	})
	if err != nil {
		return err
	}

	return p.db.Update(func(tx *bolt.Tx) error {
		for _, k := range toDelete {
			err := tx.Bucket(sessions).Delete(k)
			if err != nil {
				return err
			}
		}
		return nil
	})
}
