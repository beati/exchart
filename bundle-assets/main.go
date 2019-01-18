package main

import (
	"log"

	"github.com/shurcooL/vfsgen"

	"bitbucket.org/beati/budget/budget-server/assets/data"
)

func main() {
	err := vfsgen.Generate(data.Files, vfsgen.Options{
		Filename:        "budget-server/assets/data/assets_prod.go",
		PackageName:     "data",
		BuildTags:       "!dev",
		VariableName:    "Files",
		VariableComment: "Files is a http.FileSystem that contains static assets of the application client.",
	})
	if err != nil {
		log.Fatalln(err)
	}
}
