package postgres

import (
	"bitbucket.org/beati/budget/budget-server/domain"
)

// GetAccount implements domain.AccountTx.
func (tx Tx) GetAccount(accountID domain.EntityID) (*domain.Account, error) {
	account := &domain.Account{}
	err := tx.sqlTx.Collection("accounts").Find("account_id", accountID).One(account)
	return account, err
}

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
