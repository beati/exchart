package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

func (interactor *BudgetInteractor) GetAccount(ctx context.Context, accountID domain.EntityID) (account domain.AccountData, err error) {
	return nil, nil
}

// UpdateAccount updates an account.
func (interactor *BudgetInteractor) UpdateAccount(ctx context.Context, accountID domain.EntityID, name string) (err error) {
	err = domain.IsAccountNameValid(name)
	if err != nil {
		return err
	}

	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	return tx.SetAccountName(accountID, name)
}
