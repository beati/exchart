package domain

import (
	"time"
)

// A RecurringMovement represents an account recurring movement of money.
type RecurringMovement struct {
	ID         EntityID   `db:"recurring_movement_id,omitempty"`
	CategoryID EntityID   `db:"category_id"`
	Amount     int64      `db:"amount"`
	FirstYear  int        `db:"first_year"`
	LastYear   int        `db:"last_year"`
	FirstMonth time.Month `db:"first_month"`
	LastMonth  time.Month `db:"last_month"`
}

// An RecurringMovementTx interface is used to interact with a persistence solution.
type RecurringMovementTx interface {
	GetRecurringMovements(budgetID EntityID) ([]RecurringMovement, error)
	GetRecurringMovementsByYear(budgetID EntityID, year int) ([]RecurringMovement, error)
	GetRecurringMovementsByMonth(budgetID EntityID, year int, month time.Month) ([]RecurringMovement, error)
	GetRecurringMovement(movementID EntityID) (*RecurringMovement, error)
	AddRecurringMovement(movement *RecurringMovement) error
	UpdateRecurringMovement(movement *RecurringMovement) error
	DeleteRecurringMovement(movementID EntityID) error
}

// NewRecurringMovement returns a new RecurringMovement.
func NewRecurringMovement(categoryID EntityID, amount int64, firstYear int, firstMonth time.Month) (*RecurringMovement, error) {
	if amount >= 0 {
		return nil, ErrBadParameters
	}

	if !(AllMonth <= firstMonth && firstMonth <= time.December) {
		return nil, ErrBadParameters
	}

	m := &RecurringMovement{
		CategoryID: categoryID,
		Amount:     amount,
		FirstYear:  firstYear,
		FirstMonth: firstMonth,
	}

	return m, nil
}

// Update sets some of m properties.
func (m *RecurringMovement) Update(categoryID EntityID, firstYear int, firstMonth time.Month, lastYear int, lastMonth time.Month) error {
	if !(AllMonth <= firstMonth && firstMonth <= time.December) {
		return ErrBadParameters
	}

	if !(AllMonth <= lastMonth && lastMonth <= time.December) {
		return ErrBadParameters
	}

	m.CategoryID = categoryID
	m.FirstYear = firstYear
	m.FirstMonth = firstMonth
	m.LastYear = lastYear
	m.LastMonth = lastMonth

	return nil
}
