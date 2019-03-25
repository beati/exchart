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

// AddJointBudget adds a joint budget to an account.
func (interactor *BudgetInteractor) AddJointBudget(ctx context.Context, accountID domain.EntityID, email string) (budgetData domain.BudgetData, err error) {
	budgetData, err = interactor.tryAddJointBudget(ctx, accountID, email)
	if err == domain.ErrAlreadyExists {
		budgetData, err = interactor.enableJointBudget(ctx, accountID, email)
	}
	return
}

func (interactor *BudgetInteractor) tryAddJointBudget(ctx context.Context, accountID domain.EntityID, email string) (budgetData domain.BudgetData, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	requestedUser, err := tx.GetUserByEmail(email)
	if err != nil {
		return
	}

	budget, err := domain.NewJointBudget(accountID, requestedUser.AccountID)
	if err != nil {
		return
	}

	err = tx.AddBudget(budget)
	if err != nil {
		return
	}

	requestedAccount, err := tx.GetAccount(requestedUser.AccountID)
	if err != nil {
		return
	}

	budgetData = budget.Data(accountID, requestedAccount.Name)
	budgetData.Categories = []domain.Category{}
	return
}

func (interactor *BudgetInteractor) enableJointBudget(ctx context.Context, accountID domain.EntityID, email string) (budgetData domain.BudgetData, err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	requestedUser, err := tx.GetUserByEmail(email)
	if err != nil {
		return
	}

	requestedAccount, err := tx.GetAccount(requestedUser.AccountID)
	if err != nil {
		return
	}

	budget, err := tx.LockBudgetByAccountID(accountID, requestedUser.AccountID)
	if err != nil {
		return
	}

	err = budget.Enable(accountID)
	if err != nil {
		return
	}

	err = tx.UpdateBudget(budget)
	if err != nil {
		return
	}

	categories, err := tx.GetCategories(budget.ID)
	if err != nil {
		return
	}

	budgetData = budget.Data(accountID, requestedAccount.Name)
	budgetData.Categories = categories
	return budgetData, nil
}

// AcceptJointBudget set a joint budget as accepted by the account associated with accountID.
func (interactor *BudgetInteractor) AcceptJointBudget(ctx context.Context, accountID, budgetID domain.EntityID) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	budget, err := tx.LockBudget(budgetID)
	if err != nil {
		return
	}

	err = budget.Accept(accountID)
	if err != nil {
		return
	}

	return tx.UpdateBudget(budget)
}

// DisableJointBudget set a joint budget as disabled.
func (interactor *BudgetInteractor) DisableJointBudget(ctx context.Context, accountID, budgetID domain.EntityID) (err error) {
	tx, err := interactor.repo.NewTx(ctx)
	if err != nil {
		return
	}
	defer tx.Close(&err)

	budget, err := tx.LockBudget(budgetID)
	if err != nil {
		return
	}

	err = budget.Disable(accountID)
	if err != nil {
		return
	}

	return tx.UpdateBudget(budget)
}
