package cmd

import (
	"github.com/spf13/cobra"
)

// startCmd represents the start command
var startCmd = &cobra.Command{
	Use:   "start",
	Short: "Start the server",
	RunE: func(cmd *cobra.Command, args []string) error {
		initConfig()

		return nil
	},
}

func init() {
	rootCmd.AddCommand(startCmd)
}
