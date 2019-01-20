package postgres

import (
	"context"
	"errors"
	"time"

	"upper.io/db.v3/lib/sqlbuilder"
)

var schema = `
DROP TABLE IF EXISTS schema_version, characters, tasks, completions, weekly_goals, weekly_goals_tasks, seasons, users CASCADE;

CREATE TABLE schema_version (
	version        integer NOT NULL,
	migration_date timestamp NOT NULL
);

CREATE TABLE characters (
	character_id bigserial PRIMARY KEY,
	name         text NOT NULL,
	xp           integer NOT NULL,
	max_xp       integer NOT NULL
);

CREATE TABLE tasks (
	task_id        bigserial PRIMARY KEY,
	character_id   bigint NOT NULL REFERENCES characters ON DELETE CASCADE,
	type           integer NOT NULL,
	deleted        boolean NOT NULL,
	description    text NOT NULL,
	creation_date  date NOT NULL,
	deletion_date  date,
	days           integer NOT NULL,
	period         integer NOT NULL,
	last_done      date
);
CREATE INDEX tasks_character_id ON tasks (character_id);
CREATE INDEX tasks_deleted ON tasks (deleted);

CREATE TABLE completions (
	completion_id bigserial PRIMARY KEY,
	task_id       bigint NOT NULL REFERENCES tasks ON DELETE CASCADE,
	date          date NOT NULL
);
CREATE INDEX completions_task_id ON completions (task_id);
CREATE INDEX completions_date ON completions (date);

CREATE TABLE weekly_goals (
	weekly_goal_id bigserial PRIMARY KEY,
	character_id   bigint NOT NULL REFERENCES characters ON DELETE CASCADE,
	start          date NOT NULL,
	closed         boolean NOT NULL,
	rewarded       boolean NOT NULL
);
CREATE INDEX weekly_goals_character_id ON weekly_goals (character_id);
CREATE INDEX weekly_goals_start ON weekly_goals (start);

CREATE TABLE weekly_goals_tasks (
	weekly_goal_id bigint NOT NULL REFERENCES weekly_goals ON DELETE CASCADE,
	task_id        bigint NOT NULL REFERENCES tasks ON DELETE CASCADE,
	PRIMARY KEY (weekly_goal_id, task_id)
);

CREATE TABLE seasons (
	season_id       bigserial PRIMARY KEY,
	character_id    bigint NOT NULL REFERENCES characters ON DELETE CASCADE,
	start           date NOT NULL,
	reward_planning bigint NOT NULL,
	rewards         integer NOT NULL
);
CREATE INDEX seasons_character_id ON seasons (character_id);

CREATE TABLE users (
	user_id                bigserial PRIMARY KEY,
	email                  text NOT NULL UNIQUE,
	password_hash          text NOT NULL,
	password_reset_token   text NOT NULL,
	character_id           bigint NOT NULL UNIQUE REFERENCES characters ON DELETE CASCADE,
	email_verified         boolean NOT NULL,
	email_verification_key text NOT NULL,
	encrypted_mode         boolean NOT NULL,
	encryption_salt        text NOT NULL
);
CREATE INDEX users_email ON users (email);
`

var migrations = []func(tx sqlbuilder.Tx) error{
	func(tx sqlbuilder.Tx) error {
		_, err := tx.Exec(`
ALTER TABLE users ADD COLUMN encrypted_mode boolean;
UPDATE users SET encrypted_mode = false;
ALTER TABLE users ALTER COLUMN encrypted_mode SET NOT NULL;
ALTER TABLE users ADD COLUMN encryption_salt text;
ALTER TABLE tasks ADD COLUMN period integer;
		`)
		return err
	},
	func(tx sqlbuilder.Tx) error {
		_, err := tx.Exec(`
UPDATE tasks SET period = 0;
UPDATE users SET encryption_salt = '';
ALTER TABLE tasks ALTER COLUMN period SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN days SET NOT NULL;
ALTER TABLE users ALTER COLUMN encryption_salt SET NOT NULL;
		`)
		return err
	},
	func(tx sqlbuilder.Tx) error {
		_, err := tx.Exec(`
ALTER TABLE users RENAME COLUMN email_token TO email_verification_key;
		`)
		return err
	},
	func(tx sqlbuilder.Tx) error {
		_, err := tx.Exec(`
ALTER TABLE weekly_goals ADD COLUMN rewarded boolean;
UPDATE weekly_goals SET rewarded = true;
ALTER TABLE weekly_goals ALTER COLUMN rewarded SET NOT NULL;
		`)
		return err
	},
	func(tx sqlbuilder.Tx) error {
		_, err := tx.Exec(`
ALTER TABLE users ADD COLUMN password_reset_token text;
UPDATE users SET password_reset_token = '';
ALTER TABLE users ALTER COLUMN password_reset_token SET NOT NULL;
		`)
		return err
	},
}

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
