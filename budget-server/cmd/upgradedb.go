package cmd

import (
	"github.com/spf13/cobra"
)

// upgradedbCmd represents the upgradedb command
var upgradedbCmd = &cobra.Command{
	Use:   "upgradedb",
	Short: "Upgrade database",
	RunE: func(cmd *cobra.Command, args []string) error {
		initConfig()

		return nil
	},
}

func init() {
	rootCmd.AddCommand(upgradedbCmd)
}
