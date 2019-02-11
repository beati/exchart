package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// GetAccount returns account data associated with accountID.
func (interactor *BudgetInteractor) GetAccount(ctx context.Context, accountID domain.EntityID) (accountData domain.AccountData, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	account, err := tx.GetAccount(accountID)
	if err != nil {
		return
	}

	accountData.Name = account.Name

	budgets, err := tx.GetBudgets(account.ID)
	if err != nil {
		return
	}

	accountData.Budgets = make([]domain.BudgetData, 0, len(budgets))

	for _, budget := range budgets {
		with := ""
		if !budget.Main && budget.AccountID1 != 0 && budget.AccountID2 != 0 {
			jointBudgetID := budget.AccountID1
			if jointBudgetID == account.ID {
				jointBudgetID = budget.AccountID2
			}

			var withAccount *domain.Account
			withAccount, err = tx.GetAccount(jointBudgetID)
			if err != nil {
				return
			}

			with = withAccount.Name
		}
		accountData.Budgets = append(accountData.Budgets, budget.Data(accountID, with))
	}

	return
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
