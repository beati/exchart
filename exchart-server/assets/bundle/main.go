package main

import (
	"log"

	"github.com/shurcooL/vfsgen"

	"github.com/beati/exchart/exchart-server/assets/data"
)

func main() {
	err := vfsgen.Generate(data.Files, vfsgen.Options{
		Filename:        "exchart-server/assets/data/assets_prod.go",
		PackageName:     "data",
		BuildTags:       "!dev",
		VariableName:    "Files",
		VariableComment: "Files is a http.FileSystem that contains static assets of the application client.",
	})
	if err != nil {
		log.Fatalln(err)
	}
}
