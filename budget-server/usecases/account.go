package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

type AccountInfo struct {
	Name    string
	Budgets []struct {
	}
}

func (interactor *BudgetInteractor) GetAccount() (err error) {
	return nil
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
