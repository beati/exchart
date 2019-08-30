package cmd

import (
	"context"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/beati/exchart/exchart-server/interfaces/persistence/postgres"
)

// initdbCmd represents the initdb command
var initdbCmd = &cobra.Command{
	Use:          "initdb",
	Short:        "Initialize database",
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		initConfig()

		postgresConfig := postgres.RepositoryConfig{}
		err := viper.UnmarshalKey("PostgreSQL", &postgresConfig)
		if err != nil {
			return err
		}

		repo, err := postgres.NewRepository(&postgresConfig)
		if err != nil {
			return err
		}

		return repo.InitDB(context.Background())
	},
}

func init() {
	rootCmd.AddCommand(initdbCmd)
}
