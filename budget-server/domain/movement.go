package domain

import "time"

// A Movement represents an account movment of money.
type Movement struct {
	ID       EntityID   `db:"movement_id,omitempty"`
	BudgetID EntityID   `db:"budget_id"`
	Amount   int64      `db:"amount"`
	Month    time.Month `db:"month"`
	Year     int        `db:"year"`
}

// An MovementTx interface is used to interact with a persistence solution.
type MovementTx interface {
}
