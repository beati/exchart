package domain

import "time"

// A Movement represents an account movment of money.
type Movement struct {
	ID        EntityID   `db:"movement_id,omitempty"`
	AccountID EntityID   `db:"account_id"`
	Amount    int        `db:"amount"`
	Month     time.Month `db:"month"`
	Year      int        `db:"year"`
}

// An MovementTx interface is used to interact with a persistence solution.
type MovementTx interface {
}
