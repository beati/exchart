package postgres

import (
	"context"
	"errors"
	"time"

	"upper.io/db.v3/lib/sqlbuilder"
)

var schema = `
DROP TABLE IF EXISTS schema_version, users CASCADE;

CREATE TABLE schema_version (
	version        integer NOT NULL,
	migration_date timestamp NOT NULL
);

CREATE TABLE users (
	user_id              bigserial PRIMARY KEY,
	account_id           bigint NOT NULL UNIQUE REFERENCES accounts ON DELETE CASCADE,
	email                text NOT NULL UNIQUE,
	password_hash        text NOT NULL,
	password_reset_token text NOT NULL,
	change_email_token   text NOT NULL,
	email_verified       boolean NOT NULL
);
CREATE INDEX users_email ON users (email);

CREATE TABLE accounts (
	account_id bigserial PRIMARY KEY,
);
`

var migrations = []func(tx sqlbuilder.Tx) error{}

type schemaVersion struct {
	Version       int       `db:"version"`
	MigrationDate time.Time `db:"migration_date"`
}

// InitDB initialize the database schema.
func (repo *Repository) InitDB(ctx context.Context) error {
	return repo.db.Tx(ctx, func(tx sqlbuilder.Tx) error {
		_, err := tx.Exec(schema)
		if err != nil {
			return err
		}

		return insertCurrentVersion(tx)
	})
}

// MigrateDB update the database schema.
func (repo *Repository) MigrateDB(ctx context.Context) error {
	return repo.db.Tx(ctx, func(tx sqlbuilder.Tx) error {
		currentVersion := schemaVersion{}
		err := tx.Collection("schema_version").Find().OrderBy("-version").One(&currentVersion)
		if err != nil {
			return err
		}

		targetVersion := len(migrations)
		if targetVersion > currentVersion.Version {
			for i := currentVersion.Version; i < len(migrations); i++ {
				err := migrations[i](tx)
				if err != nil {
					return err
				}
			}
			return insertCurrentVersion(tx)
		} else if targetVersion == currentVersion.Version {
			return errors.New("database schema already up to date")
		}
		return errors.New("higher version of the database schema already in use")
	})
}

// IsSchemaUpToDate returns an error if the database schema is not up to date.
func (repo *Repository) IsSchemaUpToDate() error {
	currentVersion := schemaVersion{}
	err := repo.db.Collection("schema_version").Find().OrderBy("-version").One(&currentVersion)
	if err != nil {
		return err
	}

	targetVersion := len(migrations)
	if targetVersion > currentVersion.Version {
		return errors.New("database schema not up to date")
	} else if targetVersion < currentVersion.Version {
		return errors.New("database schema version too high")
	}
	return nil
}

func insertCurrentVersion(tx sqlbuilder.Tx) error {
	_, err := tx.Collection("schema_version").Insert(schemaVersion{
		Version:       len(migrations),
		MigrationDate: time.Now(),
	})
	return err
}
