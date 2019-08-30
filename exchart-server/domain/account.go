package domain

// An Account represents the personal account of a user.
type Account struct {
	ID   EntityID `db:"account_id,omitempty"`
	Name string   `db:"name"`
}

// An AccountData represents client available data of an account.
type AccountData struct {
	Name    string
	Budgets []BudgetData
}

// An AccountTx interface is used to interact with a persistence solution.
type AccountTx interface {
	GetAccount(accountID EntityID) (*Account, error)
	AddAccount(account *Account) error
	SetAccountName(accountID EntityID, name string) error
}

// IsAccountNameValid returns nil if name is a valid account name.
func IsAccountNameValid(name string) error {
	if name == "" {
		return ErrBadParameters
	}
	return nil
}

// NewAccount returns a new Account.
func NewAccount(name string) (*Account, error) {
	err := IsAccountNameValid(name)
	if err != nil {
		return nil, err
	}

	return &Account{
		Name: name,
	}, nil
}
