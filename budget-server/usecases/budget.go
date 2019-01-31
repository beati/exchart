package usecases

import (
	"context"

	"bitbucket.org/beati/budget/budget-server/domain"
)

// A BudgetInteractor handles usecases related to budgets.
type BudgetInteractor struct {
	repo Repository
}

// NewBudgetInteractor returns a new BudgetInteractor.
func NewBudgetInteractor(repo Repository) *BudgetInteractor {
	return &BudgetInteractor{
		repo: repo,
	}
}

func (interactor *BudgetInteractor) AddJointBudget(ctx context.Context, accountID domain.EntityID, email string) (err error) {
	return nil
}

func (interactor *BudgetInteractor) AcceptJointBudget(ctx context.Context, accountID, budgetID domain.EntityID) (err error) {
	return nil
}

func (interactor *BudgetInteractor) CancelJointBudget(ctx context.Context, accountID, budgetID domain.EntityID) (err error) {
	return nil
}

func (interactor *BudgetInteractor) DisableJointBudget(ctx context.Context, accountID, budgetID domain.EntityID) (err error) {
	return nil
}
