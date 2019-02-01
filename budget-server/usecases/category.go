package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

func (interactor *BudgetInteractor) AddCategory(ctx context.Context, accountID, budgetID domain.EntityID, name string) (err error) {
	return nil
}

func (interactor *BudgetInteractor) UpdateCategory(ctx context.Context, accountID, categoryID domain.EntityID, name string) (err error) {
	return nil
}

func (interactor *BudgetInteractor) DeleteCategory(ctx context.Context, accountID, categoryID domain.EntityID) (err error) {
	return nil
}
