package domain

// A Budget represents a budget. It can be the main budget of a user or a joint budget of two users.
type Budget struct {
	ID         EntityID `db:"budget_id,omitempty"`
	AccountID1 EntityID `db:"account_id_1,omitempty"`
	AccountID2 EntityID `db:"account_id_2,omitempty"`
	Accepted1  bool     `db:"accepted_1"`
	Accepted2  bool     `db:"accepted_2"`
	Main       bool     `db:"main"`
	Disabled   bool     `db:"disabled"`
}

// A BudgetStatus represents the status of a budget.
type BudgetStatus int

// Possible values for a BudgetStatus.
const (
	Main BudgetStatus = iota
	Open
	ToAccept
	NotAccepted
)

// A BudgetData represents client available data of a budget.
type BudgetData struct {
	ID     EntityID
	Status BudgetStatus
	With   string
}

// An BudgetTx interface is used to interact with a persistence solution.
type BudgetTx interface {
	GetBudgets(accountID EntityID) ([]Budget, error)
	LockBudget(budgetID EntityID) (*Budget, error)
	LockBudgetByAccountID(accountID1, accountID2 EntityID) (*Budget, error)
	LockBudgetByCategoryID(categoryID EntityID) (*Budget, error)
	AddBudget(budget *Budget) error
	UpdateBudget(budget *Budget) error
}

// NewMainBudget returns a new main Budget for the account associated with accountID.
func NewMainBudget(accountID EntityID) *Budget {
	return &Budget{
		Main:       true,
		AccountID1: accountID,
		Accepted1:  true,
		Accepted2:  true,
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

// Data returns client available data of b.
func (b *Budget) Data(accountID EntityID, with string) BudgetData {
	var status BudgetStatus
	if b.Main {
		status = Main
	} else if b.Accepted1 && b.Accepted2 {
		status = Open
	} else if (b.Accepted1 && accountID == b.AccountID1) || (b.Accepted2 && accountID == b.AccountID2) {
		status = NotAccepted
	} else {
		status = ToAccept
	}

	return BudgetData{
		ID:     b.ID,
		With:   with,
		Status: status,
	}
}

// Enable set b as enabled.
func (b *Budget) Enable(accountID EntityID) error {
	if accountID != b.AccountID1 && accountID != b.AccountID2 {
		return ErrNotAllowed
	}

	if b.Main || !b.Disabled {
		return ErrBadParameters
	}

	b.Disabled = false

	switch accountID {
	case b.AccountID1:
		b.Accepted1 = true
		b.Accepted2 = false
	case b.AccountID2:
		b.Accepted2 = true
		b.Accepted1 = false
	}

	return nil
}

// Accept set the joint budget b as accepted by the account associated with accountID.
func (b *Budget) Accept(accountID EntityID) error {
	if accountID != b.AccountID1 && accountID != b.AccountID2 {
		return ErrNotAllowed
	}

	if b.Main || b.Disabled {
		return ErrBadParameters
	}

	switch accountID {
	case b.AccountID1:
		if b.Accepted1 {
			return ErrBadParameters
		}
		b.Accepted1 = true
	case b.AccountID2:
		if b.Accepted2 {
			return ErrBadParameters
		}
		b.Accepted2 = true
	}

	return nil
}

// Disable set b as disabled.
func (b *Budget) Disable(accountID EntityID) error {
	if accountID != b.AccountID1 && accountID != b.AccountID2 {
		return ErrNotAllowed
	}

	if b.Main || b.Disabled {
		return ErrBadParameters
	}

	b.Disabled = true
	b.Accepted1 = false
	b.Accepted2 = false

	return nil
}

// IsOwner returns nil if an operation can be done to b by the account associated with accountID.
func (b *Budget) IsOwner(accountID EntityID) error {
	if accountID != b.AccountID1 && accountID != b.AccountID2 {
		return ErrNotAllowed
	}

	if b.Disabled || !b.Accepted1 || !b.Accepted2 {
		return ErrBadParameters
	}

	return nil
}
