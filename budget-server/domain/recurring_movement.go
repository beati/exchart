package domain

import "time"

// A Period represents the period of a recurring movement.
type Period int

// Possible values for a Period
const (
	Monthly Period = iota
	Yearly
)

// A RecurringMovement represents an account recurring movement of money.
type RecurringMovement struct {
	ID         EntityID   `db:"movement_id,omitempty"`
	BudgetID   EntityID   `db:"budget_id"`
	Amount     int64      `db:"amount"`
	Period     Period     `db:"period"`
	FirstYear  int        `db:"first_year"`
	LastYear   int        `db:"last_year"`
	FirstMonth time.Month `db:"first_month"`
	LastMonth  time.Month `db:"last_month"`
}

// An RecurringMovementTx interface is used to interact with a persistence solution.
type RecurringMovementTx interface {
}
