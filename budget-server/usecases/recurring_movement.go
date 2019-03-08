package usecases

import (
	"context"
	"time"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// GetRecurringMovements returns all movements of a budget.
func (interactor *BudgetInteractor) GetRecurringMovements(ctx context.Context, accountID, budgetID domain.EntityID) (movements []domain.RecurringMovement, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	budget, err := tx.LockBudget(budgetID)
	if err != nil {
		return
	}

	if budget.AccountID1 != accountID && budget.AccountID2 != accountID {
		return nil, domain.ErrNotAllowed
	}

	return tx.GetRecurringMovements(budgetID)
}

// GetRecurringMovementsByYear returns all movements of a budget for a year.
func (interactor *BudgetInteractor) GetRecurringMovementsByYear(ctx context.Context, accountID, budgetID domain.EntityID, year int) (movements []domain.RecurringMovement, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	budget, err := tx.LockBudget(budgetID)
	if err != nil {
		return
	}

	if budget.AccountID1 != accountID && budget.AccountID2 != accountID {
		return nil, domain.ErrNotAllowed
	}

	return tx.GetRecurringMovementsByYear(budgetID, year)
}

// GetRecurringMovementsByMonth returns all movements of a budget for a year.
func (interactor *BudgetInteractor) GetRecurringMovementsByMonth(ctx context.Context, accountID, budgetID domain.EntityID, year int, month time.Month) (movements []domain.RecurringMovement, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	budget, err := tx.LockBudget(budgetID)
	if err != nil {
		return
	}

	if budget.AccountID1 != accountID && budget.AccountID2 != accountID {
		return nil, domain.ErrNotAllowed
	}

	return tx.GetRecurringMovementsByMonth(budgetID, year, month)
}

// AddRecurringMovement adds a recurring movement to a budget.
func (interactor *BudgetInteractor) AddRecurringMovement(ctx context.Context, accountID, categoryID domain.EntityID, amount int64, firstYear int, firstMonth time.Month) (movement *domain.RecurringMovement, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	budget, err := tx.LockBudgetByCategoryID(categoryID)
	if err != nil {
		return
	}

	err = budget.IsOwner(accountID)
	if err != nil {
		return
	}

	movement, err = domain.NewRecurringMovement(categoryID, amount, firstYear, firstMonth)
	if err != nil {
		return
	}

	err = tx.AddRecurringMovement(movement)
	return
}

// UpdateRecurringMovement updates a recurring movement.
func (interactor *BudgetInteractor) UpdateRecurringMovement(ctx context.Context, accountID, movementID, categoryID domain.EntityID, firstYear int, firstMonth time.Month, lastYear int, lastMonth time.Month) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	movement, err := tx.GetRecurringMovement(movementID)
	if err != nil {
		return
	}

	err = movement.Update(categoryID, firstYear, firstMonth, lastYear, lastMonth)
	if err != nil {
		return
	}

	budget, err := tx.LockBudgetByCategoryID(movement.CategoryID)
	if err != nil {
		return
	}

	err = budget.IsOwner(accountID)
	if err != nil {
		return
	}

	category, err := tx.GetCategory(categoryID)
	if err != nil {
		return
	}

	if category.BudgetID != budget.ID {
		return domain.ErrBadParameters
	}

	return tx.UpdateRecurringMovement(movement)
}

// DeleteRecurringMovement deletes a recurring movement.
func (interactor *BudgetInteractor) DeleteRecurringMovement(ctx context.Context, accountID, movementID domain.EntityID) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	movement, err := tx.GetRecurringMovement(movementID)
	if err != nil {
		return
	}

	budget, err := tx.LockBudgetByCategoryID(movement.CategoryID)
	if err != nil {
		return
	}

	err = budget.IsOwner(accountID)
	if err != nil {
		return
	}

	return tx.DeleteRecurringMovement(movementID)
}
