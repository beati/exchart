package usecases

import (
	"context"
	"time"

	"bitbucket.org/beati/budget/budget-server/domain"
)

func (interactor *BudgetInteractor) AddMovement(ctx context.Context, accountID, budgetID domain.EntityID, amount int64, categoryID domain.EntityID, year int, month time.Month) (err error) {
	return nil
}

func (interactor *BudgetInteractor) UpdateMovement(ctx context.Context, accountID, movementID domain.EntityID, amount int64, year int, month time.Month) (err error) {
	return nil
}

func (interactor *BudgetInteractor) DeleteMovement(ctx context.Context, accountID, movementID domain.EntityID) (err error) {
	return nil
}
