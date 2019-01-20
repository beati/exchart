package postgres

import (
	"context"

	"upper.io/db.v3/lib/sqlbuilder"
	"upper.io/db.v3/postgresql"

	"bitbucket.org/beati/budget/budget-server/usecases"
)

const (
	pqErrorUniqueViolation = "23505"
)

// A RepositoryConfig represents informations required to connect to a postgresql database.
type RepositoryConfig struct {
	Database                      string
	User                          string
	Password                      string
	Host                          string
	SSLMode                       string
	ConnectTimeout                string
	PreparedStatementCacheEnabled bool
	MaxIdleConns                  int
	MaxOpenConns                  int
}

// A Repository is used to handle request to the database.
type Repository struct {
	db sqlbuilder.Database
}

// A Tx represents a transaction with the database.
type Tx struct {
	sqlTx sqlbuilder.Tx
}

// NewRepository create a new repository.
func NewRepository(config *RepositoryConfig) (Repository, error) {
	settings := postgresql.ConnectionURL{
		User:     config.User,
		Password: config.Password,
		Host:     config.Host,
		Database: config.Database,
		Options:  map[string]string{"sslmode": config.SSLMode},
	}

	db, err := postgresql.Open(settings)
	if err != nil {
		return Repository{}, err
	}

	db.SetPreparedStatementCache(config.PreparedStatementCacheEnabled)
	db.SetMaxIdleConns(config.MaxIdleConns)
	db.SetMaxOpenConns(config.MaxOpenConns)

	return Repository{db}, nil
}

// NewTx implements usecases.Repository.
func (repo Repository) NewTx(ctx context.Context) (usecases.Tx, error) {
	sqlTx, err := repo.db.NewTx(ctx)
	return Tx{sqlTx}, err
}

// Close implements usecases.Repository.
func (tx Tx) Close(err *error) {
	if *err == nil {
		*err = tx.sqlTx.Commit()
	}
	if *err != nil {
		rollbackErr := tx.sqlTx.Rollback()
		if rollbackErr != nil {
			*err = rollbackErr
		}
	}
}
