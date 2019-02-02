package domain

import "time"

// A Movement represents an account movement of money.
type Movement struct {
	ID         EntityID   `db:"movement_id,omitempty"`
	CategoryID EntityID   `db:"category_id"`
	Amount     int64      `db:"amount"`
	Year       int        `db:"year"`
	Month      time.Month `db:"month"`
}

// An MovementTx interface is used to interact with a persistence solution.
type MovementTx interface {
	GetMovement(movementID EntityID) (*Movement, error)
	AddMovement(movement *Movement) error
	UpdateMovement(movement *Movement) error
	DeleteMovement(movementID EntityID) error
}

// NewMovement returns a new Movement.
func NewMovement(categoryID EntityID, amount int64, year int, month time.Month) (*Movement, error) {
	if amount == 0 {
		return nil, ErrBadParameters
	}

	m := &Movement{
		Amount: amount,
	}
	err := m.Update(categoryID, year, month)
	return m, err
}

// Update sets some of m properties.
func (m *Movement) Update(categoryID EntityID, year int, month time.Month) error {
	if !(time.January <= month || month <= time.December) {
		return ErrBadParameters
	}

	m.CategoryID = categoryID
	m.Year = year
	m.Month = month
	return nil
}
