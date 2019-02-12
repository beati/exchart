package session

import (
	"time"

	"github.com/dgraph-io/badger"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// BadgerKeyStore implements KeyStore with a badger backend.
type BadgerKeyStore struct {
	db *badger.DB
}

// NewBadgerKeyStore returns a BadgerKeystore. The database will be stored in the directory path.
func NewBadgerKeyStore(path string, logger badger.Logger) (BadgerKeyStore, error) {
	badger.SetLogger(logger)

	options := badger.DefaultOptions
	options.Dir = path
	options.ValueDir = path
	options.Truncate = true
	options.Logger = logger

	db, err := badger.Open(options)
	if err != nil {
		return BadgerKeyStore{}, err
	}

	go func() {
		ticker := time.NewTicker(2 * time.Hour)
		for range ticker.C {
		again:
			err := db.RunValueLogGC(0.5)
			if err == nil {
				goto again
			}
		}
	}()

	return BadgerKeyStore{db}, nil
}

// Get implements KeyStore.
func (ks BadgerKeyStore) Get(userID domain.EntityID) ([]byte, error) {
	var key []byte
	userIDBytes := userID.Bytes()

	err := ks.db.View(func(tnx *badger.Txn) error {
		item, err := tnx.Get(userIDBytes[:])
		if err != nil {
			return err
		}
		key, err = item.ValueCopy(nil)
		return err
	})
	if err != nil && err != badger.ErrKeyNotFound {
		return nil, err
	}

	return key, nil
}

// Set implements KeyStore.
func (ks BadgerKeyStore) Set(userID domain.EntityID, key []byte) error {
	userIDBytes := userID.Bytes()

	return ks.db.Update(func(tnx *badger.Txn) error {
		return tnx.Set(userIDBytes[:], key)
	})
}

// Delete implements KeyStore.
func (ks BadgerKeyStore) Delete(userID domain.EntityID) error {
	userIDBytes := userID.Bytes()

	return ks.db.Update(func(tnx *badger.Txn) error {
		return tnx.Delete(userIDBytes[:])
	})
}
