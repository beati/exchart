package domain

import (
	"errors"
	"time"
)

// A Period represents the period of a recurring movement.
type Period int

// Possible values for a Period.
const (
	Monthly Period = iota
	Yearly
)

// A RecurringMovement represents an account recurring movement of money.
type RecurringMovement struct {
	ID         EntityID   `db:"recurring_movement_id,omitempty"`
	CategoryID EntityID   `db:"category_id"`
	Amount     int64      `db:"amount"`
	Period     Period     `db:"period"`
	FirstYear  int        `db:"first_year"`
	LastYear   int        `db:"last_year"`
	FirstMonth time.Month `db:"first_month"`
	LastMonth  time.Month `db:"last_month"`
}

// An RecurringMovementTx interface is used to interact with a persistence solution.
type RecurringMovementTx interface {
	GetRecurringMovement(movementID EntityID) (*RecurringMovement, error)
	AddRecurringMovement(movement *RecurringMovement) error
	UpdateRecurringMovement(movement *RecurringMovement) error
	DeleteRecurringMovement(movementID EntityID) error
}

// NewRecurringMovement returns a new RecurringMovement.
func NewRecurringMovement(categoryID EntityID, amount int64, period Period, firstYear int, firstMonth time.Month) (*RecurringMovement, error) {
	if amount == 0 {
		return nil, ErrBadParameters
	}

	m := &RecurringMovement{
		CategoryID: categoryID,
		Amount:     amount,
		Period:     period,
		FirstYear:  firstYear,
		FirstMonth: firstMonth,
	}

	switch m.Period {
	case Monthly:
		if !(time.January <= m.FirstMonth || m.FirstMonth <= time.December) {
			return nil, ErrBadParameters
		}
	case Yearly:
		m.FirstMonth = 0
	default:
		return nil, ErrBadParameters
	}

	return m, nil
}

// Update sets some of m properties.
func (m *RecurringMovement) Update(categoryID EntityID, firstYear int, firstMonth time.Month, lastYear int, lastMonth time.Month) error {
	switch m.Period {
	case Monthly:
		if !(time.January <= firstMonth || firstMonth <= time.December) {
			return ErrBadParameters
		}
		if !(time.January <= lastMonth || lastMonth <= time.December) {
			return ErrBadParameters
		}
	case Yearly:
		firstMonth = 0
		lastMonth = 0
	default:
		return errors.New("invalid period value in database")
	}

	m.CategoryID = categoryID
	m.FirstYear = firstYear
	m.FirstMonth = firstMonth
	m.LastYear = lastYear
	m.LastMonth = lastMonth

	return nil
}
