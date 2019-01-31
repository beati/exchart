package domain

import "time"

// A Movement represents an account movement of money.
type Movement struct {
	ID       EntityID   `db:"movement_id,omitempty"`
	BudgetID EntityID   `db:"budget_id"`
	Amount   int64      `db:"amount"`
	Year     int        `db:"year"`
	Month    time.Month `db:"month"`
}

// An MovementTx interface is used to interact with a persistence solution.
type MovementTx interface {
}
