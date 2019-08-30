package postgres

import (
	"time"

	"github.com/beati/exchart/exchart-server/domain"
)

// GetMovements implements domain.CategoryTx.
func (tx Tx) GetMovements(budgetID domain.EntityID) ([]domain.Movement, error) {
	movements := []domain.Movement{}
	err := tx.sqlTx.Select("movements.*").
		From("movements").
		Join("categories").On("movements.category_id = categories.category_id").
		Join("budgets").On("categories.budget_id = budgets.budget_id").
		Where("budgets.budget_id = ?", budgetID).
		All(&movements)
	return movements, err
}

// GetMovementsByYear implements domain.CategoryTx.
func (tx Tx) GetMovementsByYear(budgetID domain.EntityID, year int) ([]domain.Movement, error) {
	movements := []domain.Movement{}
	err := tx.sqlTx.Select("movements.*").
		From("movements").
		Join("categories").On("movements.category_id = categories.category_id").
		Join("budgets").On("categories.budget_id = budgets.budget_id").
		Where("budgets.budget_id = ? AND year = ?", budgetID, year).
		All(&movements)
	return movements, err
}

// GetMovementsByMonth implements domain.CategoryTx.
func (tx Tx) GetMovementsByMonth(budgetID domain.EntityID, year int, month time.Month) ([]domain.Movement, error) {
	movements := []domain.Movement{}
	err := tx.sqlTx.Select("movements.*").
		From("movements").
		Join("categories").On("movements.category_id = categories.category_id").
		Join("budgets").On("categories.budget_id = budgets.budget_id").
		Where("budgets.budget_id = ? AND year = ? AND (month = ? OR month = 0)", budgetID, year, month).
		All(&movements)
	return movements, err
}

// GetMovement implements domain.CategoryTx.
func (tx Tx) GetMovement(movementID domain.EntityID) (*domain.Movement, error) {
	movement := &domain.Movement{}
	err := tx.sqlTx.Collection("movements").Find("movement_id", movementID).One(movement)
	return movement, err
}

// AddMovement implements domain.CategoryTx.
func (tx Tx) AddMovement(movement *domain.Movement) error {
	movementID, err := tx.sqlTx.Collection("movements").Insert(movement)
	if err != nil {
		return err
	}
	movement.ID = domain.EntityID(movementID.(int64))
	return nil
}

// UpdateMovement implements domain.CategoryTx.
func (tx Tx) UpdateMovement(movement *domain.Movement) error {
	return tx.sqlTx.Collection("movements").Find("movement_id", movement.ID).Update(movement)
}

// DeleteMovement implements domain.CategoryTx.
func (tx Tx) DeleteMovement(movementID domain.EntityID) error {
	return tx.sqlTx.Collection("movements").Find("movement_id", movementID).Delete()
}
