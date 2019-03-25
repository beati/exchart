package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// AddCategory adds a movement category to a budget.
func (interactor *BudgetInteractor) AddCategory(ctx context.Context, accountID, budgetID domain.EntityID, categoryType domain.CategoryType, name string) (category *domain.Category, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	budget, err := tx.LockBudget(budgetID)
	if err != nil {
		return
	}

	err = budget.IsOwner(accountID)
	if err != nil {
		return
	}

	category, err = domain.NewCategory(budget.ID, categoryType, name)
	if err != nil {
		return
	}

	err = tx.AddCategory(category)
	return
}

// UpdateCategory updates a category.
func (interactor *BudgetInteractor) UpdateCategory(ctx context.Context, accountID, categoryID domain.EntityID, name string) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	category, err := tx.GetCategory(categoryID)
	if err != nil {
		return
	}

	budget, err := tx.LockBudget(category.BudgetID)
	if err != nil {
		return
	}

	err = budget.IsOwner(accountID)
	if err != nil {
		return
	}

	err = category.SetName(name)
	if err != nil {
		return
	}

	return tx.UpdateCategory(category)
}

// DeleteCategory deletes a category.
func (interactor *BudgetInteractor) DeleteCategory(ctx context.Context, accountID, categoryID domain.EntityID) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	category, err := tx.GetCategory(categoryID)
	if err != nil {
		return
	}

	budget, err := tx.LockBudget(category.BudgetID)
	if err != nil {
		return
	}

	err = budget.IsOwner(accountID)
	if err != nil {
		return
	}

	return tx.DeleteCategory(categoryID)
}
