#!/bin/sh

PROJECT=exchart

cd $PROJECT-server

go install -v -ldflags "-X github.com/beati/$PROJECT/$PROJECT-server/cmd.version=$(git describe --tags).dev" -tags dev -race
