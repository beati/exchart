package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

func (interactor *BudgetInteractor) UpdateAccountName(ctx context.Context, accountID domain.EntityID, name string) (err error) {
	return nil
}
