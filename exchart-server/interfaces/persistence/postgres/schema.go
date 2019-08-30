package postgres

import (
	"context"
	"errors"
	"time"

	"upper.io/db.v3/lib/sqlbuilder"
)

var schema = `
DROP TABLE IF EXISTS schema_version, users, accounts, budgets, categories, movements, recurring_movements CASCADE;

CREATE TABLE schema_version (
	version        integer NOT NULL,
	upgrade_date timestamp NOT NULL
);

CREATE TABLE accounts (
	account_id bigserial PRIMARY KEY,
	name       text NOT NULL
);

CREATE TABLE budgets (
	budget_id    bigserial PRIMARY KEY,
	main         boolean NOT NULL,
	account_id_1 bigint REFERENCES accounts ON DELETE SET NULL,
	accepted_1   boolean NOT NULL,
	account_id_2 bigint REFERENCES accounts ON DELETE SET NULL,
	accepted_2   boolean NOT NULL,
	disabled     boolean NOT NULL,
	UNIQUE (account_id_1, account_id_2),
	CONSTRAINT account_id_order CHECK (account_id_1 = NULL OR account_id_2 = NULL OR account_id_1 < account_id_2)
);
CREATE INDEX budgets_disabled ON budgets (disabled);

CREATE TABLE categories (
	category_id bigserial PRIMARY KEY,
	budget_id   bigint NOT NULL REFERENCES budgets ON DELETE CASCADE,
	type        integer NOT NULL,
	name        text NOT NULL,
	UNIQUE (budget_id, type, name)
);

CREATE TABLE movements (
	movement_id bigserial PRIMARY KEY,
	category_id bigint NOT NULL REFERENCES categories ON DELETE RESTRICT,
	amount      bigint NOT NULL,
	year        integer NOT NULL,
	month       integer NOT NULL
);
CREATE INDEX movements_category_id ON movements (category_id);
CREATE INDEX movements_year_month ON movements (year, month);

CREATE TABLE recurring_movements (
	recurring_movement_id bigserial PRIMARY KEY,
	category_id bigint NOT NULL REFERENCES categories ON DELETE RESTRICT,
	amount      bigint NOT NULL,
	first_year  integer NOT NULL,
	last_year   integer NOT NULL,
	first_month integer NOT NULL,
	last_month  integer NOT NULL
);
CREATE INDEX recurring_movements_category_id ON recurring_movements (category_id);
CREATE INDEX recurring_movements_year_month ON recurring_movements (first_year, last_year, first_month, last_month);

CREATE TABLE users (
	user_id              bigserial PRIMARY KEY,
	account_id           bigint NOT NULL UNIQUE REFERENCES accounts ON DELETE CASCADE,
	email                text NOT NULL UNIQUE,
	password_hash        text NOT NULL,
	password_reset_token text NOT NULL,
	change_email_token   text NOT NULL,
	email_verified       boolean NOT NULL
);
`

var upgrades = []func(tx sqlbuilder.Tx) error{}

type schemaVersion struct {
	Version     int       `db:"version"`
	UpgradeDate time.Time `db:"upgrade_date"`
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

// UpgradeDB update the database schema.
func (repo *Repository) UpgradeDB(ctx context.Context) error {
	return repo.db.Tx(ctx, func(tx sqlbuilder.Tx) error {
		currentVersion := schemaVersion{}
		err := tx.Collection("schema_version").Find().OrderBy("-version").One(&currentVersion)
		if err != nil {
			return err
		}

		targetVersion := len(upgrades)
		if targetVersion > currentVersion.Version {
			for i := currentVersion.Version; i < len(upgrades); i++ {
				err := upgrades[i](tx)
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

	targetVersion := len(upgrades)
	if targetVersion > currentVersion.Version {
		return errors.New("database schema not up to date")
	} else if targetVersion < currentVersion.Version {
		return errors.New("database schema version too high")
	}
	return nil
}

func insertCurrentVersion(tx sqlbuilder.Tx) error {
	_, err := tx.Collection("schema_version").Insert(schemaVersion{
		Version:     len(upgrades),
		UpgradeDate: time.Now(),
	})
	return err
}
