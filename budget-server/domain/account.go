package domain

type Account struct {
	ID EntityID `db:"account_id,omitempty"`
}

// An AccountTx interface is used to interact with a persistence solution.
type AccountTx interface {
}
