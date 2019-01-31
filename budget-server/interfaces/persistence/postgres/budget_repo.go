package postgres

import "bitbucket.org/beati/budget/budget-server/domain"

// AddBudget implements domain.BudgetTx.
func (tx Tx) AddBudget(budget *domain.Budget) error {
	budgetID, err := tx.sqlTx.Collection("budgets").Insert(budget)
	if err != nil {
		return err
	}
	budget.ID = domain.EntityID(budgetID.(int64))
	return nil
}
