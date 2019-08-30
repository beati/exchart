package postgres

import (
	"github.com/lib/pq"
	"upper.io/db.v3/lib/sqlbuilder"

	"github.com/beati/exchart/exchart-server/domain"
)

// GetBudgets implements domain.BudgetTx.
func (tx Tx) GetBudgets(accountID domain.EntityID) ([]domain.Budget, error) {
	budgets := []domain.Budget{}
	err := tx.sqlTx.SelectFrom("budgets").Where("(account_id_1 = ? OR account_id_2 = ?) AND disabled = false", accountID, accountID).All(&budgets)
	return budgets, err
}

// LockBudget implements domain.BudgetTx.
func (tx Tx) LockBudget(budgetID domain.EntityID) (*domain.Budget, error) {
	budget := &domain.Budget{}
	rows, err := tx.sqlTx.Query("SELECT * FROM budgets WHERE budget_id = ? FOR UPDATE", budgetID)
	if err != nil {
		return nil, err
	}
	err = sqlbuilder.NewIterator(rows).One(budget)
	return budget, err
}

// LockBudgetByAccountID implements domain.BudgetTx.
func (tx Tx) LockBudgetByAccountID(accountID1, accountID2 domain.EntityID) (*domain.Budget, error) {
	if accountID2 > accountID1 {
		accountID1, accountID2 = accountID2, accountID1
	}

	budget := &domain.Budget{}
	rows, err := tx.sqlTx.Query("SELECT * FROM budgets WHERE account_id_1 = ? AND account_id_2 = ? FOR UPDATE", accountID1, accountID2)
	if err != nil {
		return nil, err
	}
	err = sqlbuilder.NewIterator(rows).One(budget)
	return budget, err
}

// LockBudgetByCategoryID implements domain.BudgetTx.
func (tx Tx) LockBudgetByCategoryID(categoryID domain.EntityID) (*domain.Budget, error) {
	budget := &domain.Budget{}
	rows, err := tx.sqlTx.Query(`
		SELECT budgets.* FROM budgets
		JOIN categories ON budgets.budget_id = categories.budget_id 
		WHERE categories.category_id = ?
		FOR UPDATE OF budgets
	`, categoryID)
	if err != nil {
		return nil, err
	}
	err = sqlbuilder.NewIterator(rows).One(budget)
	return budget, err
}

// AddBudget implements domain.BudgetTx.
func (tx Tx) AddBudget(budget *domain.Budget) error {
	budgetID, err := tx.sqlTx.Collection("budgets").Insert(budget)
	if err, ok := err.(*pq.Error); ok {
		if err.Code == pqErrorUniqueViolation {
			return domain.ErrAlreadyExists
		}
	}
	if err != nil {
		return err
	}
	budget.ID = domain.EntityID(budgetID.(int64))
	return nil
}

// UpdateBudget implements domain.BudgetTx.
func (tx Tx) UpdateBudget(budget *domain.Budget) error {
	return tx.sqlTx.Collection("budgets").Find("budget_id", budget.ID).Update(budget)
}
