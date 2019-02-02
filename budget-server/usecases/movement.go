package usecases

import (
	"context"
	"time"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// AddMovement adds a movement to a budget.
func (interactor *BudgetInteractor) AddMovement(ctx context.Context, accountID, categoryID domain.EntityID, amount int64, year int, month time.Month) (err error) {
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

	movement, err := domain.NewMovement(categoryID, amount, year, month)
	if err != nil {
		return
	}

	return tx.AddMovement(movement)
}

// UpdateMovement updates a movement.
func (interactor *BudgetInteractor) UpdateMovement(ctx context.Context, accountID, movementID, categoryID domain.EntityID, year int, month time.Month) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	movement, err := tx.GetMovement(movementID)
	if err != nil {
		return
	}

	err = movement.Update(categoryID, year, month)
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

	return tx.UpdateMovement(movement)
}

// DeleteMovement deletes a movement.
func (interactor *BudgetInteractor) DeleteMovement(ctx context.Context, accountID, movementID domain.EntityID) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	movement, err := tx.GetMovement(movementID)
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

	return tx.DeleteMovement(movementID)
}
