package cmd

import (
	"context"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/beati/exchart/exchart-server/interfaces/persistence/postgres"
)

// upgradedbCmd represents the upgradedb command
var upgradedbCmd = &cobra.Command{
	Use:          "upgradedb",
	Short:        "Upgrade database",
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

		return repo.UpgradeDB(context.Background())
	},
}

func init() {
	rootCmd.AddCommand(upgradedbCmd)
}
