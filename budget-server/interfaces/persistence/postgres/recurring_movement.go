package postgres

import (
	"time"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// GetRecurringMovements implements domain.CategoryTx.
func (tx Tx) GetRecurringMovements(budgetID domain.EntityID) ([]domain.RecurringMovement, error) {
	movements := []domain.RecurringMovement{}
	err := tx.sqlTx.Select("recurring_movements.*").
		From("recurring_movements").
		Join("categories").On("recurring_movements.category_id = categories.category_id").
		Join("budgets").On("categories.budget_id = budgets.budget_id").
		Where("budgets.budget_id = ?", budgetID).
		All(&movements)
	return movements, err
}

// GetRecurringMovementsByYear implements domain.CategoryTx.
func (tx Tx) GetRecurringMovementsByYear(budgetID domain.EntityID, year int) ([]domain.RecurringMovement, error) {
	movements := []domain.RecurringMovement{}
	err := tx.sqlTx.Select("recurring_movements.*").
		From("recurring_movements").
		Join("categories").On("recurring_movements.category_id = categories.category_id").
		Join("budgets").On("categories.budget_id = budgets.budget_id").
		Where("budgets.budget_id = ? AND first_year <= ? AND (last_year = 0 OR ? <= last_year)", budgetID, year, year).
		All(&movements)
	return movements, err
}

// GetRecurringMovementsByMonth implements domain.CategoryTx.
func (tx Tx) GetRecurringMovementsByMonth(budgetID domain.EntityID, year int, month time.Month) ([]domain.RecurringMovement, error) {
	movements := []domain.RecurringMovement{}
	err := tx.sqlTx.Select("recurring_movements.*").
		From("recurring_movements").
		Join("categories").On("recurring_movements.category_id = categories.category_id").
		Join("budgets").On("categories.budget_id = budgets.budget_id").
		Where("budgets.budget_id = ? AND (first_year < ? OR (first_year = ? AND (first_month = 0 OR first_month <= ?))) AND (last_year = 0 OR ? < last_year OR (last_year = ? AND (last_month = 0 OR ? <= last_month)))", budgetID, year, year, month, year, year, month).
		All(&movements)
	return movements, err
}

// GetRecurringMovement implements domain.CategoryTx.
func (tx Tx) GetRecurringMovement(movementID domain.EntityID) (*domain.RecurringMovement, error) {
	movement := &domain.RecurringMovement{}
	err := tx.sqlTx.Collection("recurring_movements").Find("recurring_movement_id", movementID).One(movement)
	return movement, err
}

// AddRecurringMovement implements domain.CategoryTx.
func (tx Tx) AddRecurringMovement(movement *domain.RecurringMovement) error {
	movementID, err := tx.sqlTx.Collection("recurring_movements").Insert(movement)
	if err != nil {
		return err
	}
	movement.ID = domain.EntityID(movementID.(int64))
	return nil
}

// UpdateRecurringMovement implements domain.CategoryTx.
func (tx Tx) UpdateRecurringMovement(movement *domain.RecurringMovement) error {
	return tx.sqlTx.Collection("recurring_movements").Find("recurring_movement_id", movement.ID).Update(movement)
}

// DeleteRecurringMovement implements domain.CategoryTx.
func (tx Tx) DeleteRecurringMovement(movementID domain.EntityID) error {
	return tx.sqlTx.Collection("recurring_movements").Find("recurring_movement_id", movementID).Delete()
}
