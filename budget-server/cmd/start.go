package cmd

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/spf13/cobra"

	"bitbucket.org/beati/budget/budget-server/assets"
)

// startCmd represents the start command
var startCmd = &cobra.Command{
	Use:          "start",
	Short:        "Start the server",
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		initConfig()

		router := chi.NewRouter()
		assetsHandler := assets.Handler(
			"/",
			"/test",
		)
		router.Mount("/", assetsHandler)

		server := http.Server{
			Addr:    ":8080",
			Handler: router,
		}

		return server.ListenAndServe()
	},
}

func init() {
	rootCmd.AddCommand(startCmd)
}
