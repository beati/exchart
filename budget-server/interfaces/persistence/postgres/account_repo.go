package postgres

import (
	"bitbucket.org/beati/budget/budget-server/domain"
)

// AddAccount implements domain.AccountTx.
func (tx Tx) AddAccount(account *domain.Account) error {
	accountID, err := tx.sqlTx.Collection("accounts").Insert(account)
	if err != nil {
		return err
	}
	account.ID = domain.EntityID(accountID.(int64))
	return nil
}

// SetAccountName implements domain.AccountTx.
func (tx Tx) SetAccountName(accountID domain.EntityID, name string) error {
	_, err := tx.sqlTx.Exec("UPDATE accounts SET name = ? WHERE account_id = ?", name, accountID)
	return err
}
