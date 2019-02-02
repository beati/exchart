package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// UpdateAccount updates an account.
func (interactor *BudgetInteractor) UpdateAccount(ctx context.Context, accountID domain.EntityID, name string) (err error) {
	return nil
}
