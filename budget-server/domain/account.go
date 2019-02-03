package domain

// An Account represents the personal account of a user.
type Account struct {
	ID   EntityID `db:"account_id,omitempty"`
	Name string   `db:"name"`
}

// An AccountTx interface is used to interact with a persistence solution.
type AccountTx interface {
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
