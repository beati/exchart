package cmd

import (
	"fmt"
	"runtime"

	"github.com/spf13/cobra"
)

var version string

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print budget version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("budget version %s %s\n", version, runtime.Version())
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
