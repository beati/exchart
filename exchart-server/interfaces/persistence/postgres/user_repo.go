package postgres

import (
	"github.com/lib/pq"
	db "upper.io/db.v3"

	"github.com/beati/exchart/exchart-server/domain"
	"github.com/beati/exchart/exchart-server/usecases"
)

// GetUser implements usecases.UserTx.
func (tx Tx) GetUser(userID domain.EntityID) (*usecases.User, error) {
	user := &usecases.User{}
	err := tx.sqlTx.Collection("users").Find("user_id", userID).One(user)
	if err == db.ErrNoMoreRows {
		return nil, usecases.ErrBadCredentials
	}
	return user, err
}

// GetUserByEmail implements usecases.Tx.
func (tx Tx) GetUserByEmail(email string) (*usecases.User, error) {
	user := &usecases.User{}
	err := tx.sqlTx.Collection("users").Find("email", email).One(user)
	if err == db.ErrNoMoreRows {
		return nil, domain.ErrNotFound
	}
	return user, err
}

// AddUser implements usecases.UserTx.
func (tx Tx) AddUser(user *usecases.User) error {
	userID, err := tx.sqlTx.Collection("users").Insert(user)
	if err, ok := err.(*pq.Error); ok {
		if err.Code == pqErrorUniqueViolation {
			return domain.ErrAlreadyExists
		}
	}
	if err != nil {
		return err
	}
	user.ID = domain.EntityID(userID.(int64))
	return nil
}

// UpdateUser implements usecases.UserTx.
func (tx Tx) UpdateUser(user *usecases.User) error {
	return tx.sqlTx.Collection("users").Find("user_id", user.ID).Update(user)
}

// DeleteUser implements usecases.UserTx.
func (tx Tx) DeleteUser(userID domain.EntityID) error {
	row, err := tx.sqlTx.QueryRow("SELECT account_id FROM users WHERE user_id = ?", userID)
	if err != nil {
		return err
	}
	var accountID domain.EntityID
	err = row.Scan(&accountID)
	if err != nil {
		return err
	}

	return tx.sqlTx.Collection("accounts").Find("account_id", accountID).Delete()
}
