#!/bin/sh

PROJECT=budget

cd $GOPATH/src/bitbucket.org/beati/$PROJECT/$PROJECT-server

go install -v -ldflags "-X bitbucket.org/beati/$PROJECT/$PROJECT-server/cmd.version=$(git describe --tags).dev" -tags dev -race
