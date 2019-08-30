package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var unitfile = `[Unit]
Description=exchart server
Wants=postgresql.service
After=network.target postgresql.service

[Service]
Type=simple
User=exchart
ExecStart=/home/exchart/bin/exchart-server start
Restart=on-failure
WorkingDirectory=/home/exchart/

[Install]
WantedBy=multi-user.target
`

// unitfileCmd represents the unitfile command
var unitfileCmd = &cobra.Command{
	Use:          "unitfile",
	Short:        "Print a systemd unit file",
	SilenceUsage: true,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Print(unitfile)
	},
}

func init() {
	rootCmd.AddCommand(unitfileCmd)
}
