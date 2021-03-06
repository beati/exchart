package cmd

import (
	"fmt"
	"runtime"

	"github.com/spf13/cobra"
)

var version string

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:          "version",
	Short:        "Print exchart version",
	SilenceUsage: true,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("exchart version %s %s\n", version, runtime.Version())
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
