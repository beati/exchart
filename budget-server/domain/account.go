package domain

// An Account represents the personal account of a user.
type Account struct {
	ID   EntityID `db:"account_id,omitempty"`
	Name string   `db:"name"`
}

// An AccountTx interface is used to interact with a persistence solution.
type AccountTx interface {
	AddAccount(account *Account) error
}

// NewAccount returns a new Account.
func NewAccount(name string) (*Account, error) {
	if name == "" {
		return nil, ErrBadParameters
	}

	return &Account{
		Name: name,
	}, nil
}
