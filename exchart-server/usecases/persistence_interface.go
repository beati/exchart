package usecases

import (
	"context"

	"github.com/beati/exchart/exchart-server/domain"
)

// A Repository interface is used to create transaction with a persistance solution.
type Repository interface {
	NewTx(ctx context.Context) (Tx, error)
}

// A Tx interface is used to atomically interact with a persistence solution.
type Tx interface {
	domain.Tx
	UserTx
	Close(err *error)
}
