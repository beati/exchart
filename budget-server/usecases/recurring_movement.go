package usecases

import (
	"context"
	"time"

	"bitbucket.org/beati/budget/budget-server/domain"
)

func (interactor *BudgetInteractor) AddRecurringMovement(ctx context.Context, accountID, budgetID domain.EntityID, amount int64, period domain.Period, firstYear int, firstMonth time.Month) (err error) {
	return nil
}

func (interactor *BudgetInteractor) CloseRecurringMovement(ctx context.Context, accountID, movementID domain.EntityID, lastYear int, lastMonth time.Month) (err error) {
	return nil
}

func (interactor *BudgetInteractor) DeleteRecurringMovement(ctx context.Context, accountID, movementID domain.EntityID) (err error) {
	return nil
}
