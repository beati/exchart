package domain

// A Budget represents a budget. It can be the main budget of a user or a joint budget of two users.
type Budget struct {
	ID         EntityID `db:"budget_id"`
	Main       bool     `db:"main"`
	AccountID1 EntityID `db:"account_id_1"`
	Accepted1  bool     `db:"accepted_1"`
	AccountID2 EntityID `db:"account_id_2"`
	Accepted2  bool     `db:"accepted_2"`
	Disabled   bool     `db:"disabled"`
}

// An BudgetTx interface is used to interact with a persistence solution.
type BudgetTx interface {
	AddBudget(budget *Budget) error
}

// NewMainBudget returns a new main Budget for the account associated with accountID.
func NewMainBudget(accountID EntityID) *Budget {
	return &Budget{
		Main:       true,
		AccountID1: accountID,
		Accepted1:  true,
	}
}

// NewJointBudget returns a new joint Budget for accounts associated with accountID1 and accountID2.
func NewJointBudget(requestor, requested EntityID) (*Budget, error) {
	if requestor == requested {
		return nil, ErrBadParameters
	}

	accepted1, accepted2 := true, false
	accountID1, accountID2 := requestor, requested
	if accountID2 > accountID1 {
		accountID1, accountID2 = accountID2, accountID1
		accepted1, accepted2 = accepted2, accepted1
	}

	return &Budget{
		AccountID1: accountID1,
		Accepted1:  accepted1,
		AccountID2: accountID2,
		Accepted2:  accepted2,
	}, nil
}
