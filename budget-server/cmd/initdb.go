package cmd

import (
	"github.com/spf13/cobra"
)

// initdbCmd represents the initdb command
var initdbCmd = &cobra.Command{
	Use:   "initdb",
	Short: "Initialize database",
	RunE: func(cmd *cobra.Command, args []string) error {
		initConfig()

		return nil
	},
}

func init() {
	rootCmd.AddCommand(initdbCmd)
}
