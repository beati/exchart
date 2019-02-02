package usecases

import (
	"context"
	"time"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// AddRecurringMovement adds a recurring movement to a budget.
func (interactor *BudgetInteractor) AddRecurringMovement(ctx context.Context, accountID, categoryID domain.EntityID, amount int64, period domain.Period, firstYear int, firstMonth time.Month) (err error) {
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

	movement, err := domain.NewRecurringMovement(categoryID, amount, period, firstYear, firstMonth)
	if err != nil {
		return
	}

	return tx.AddRecurringMovement(movement)
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
