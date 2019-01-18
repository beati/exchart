#!/bin/sh

PROJECT=budget

cd $GOPATH/src/bitbucket.org/beati/$PROJECT/$PROJECT-client

export MSYS2_ARG_CONV_EXCL="/static/"
ng build --aot --prod --deploy-url /static/
err=$?
if [ $err -ne 0 ]; then
	exit $err
fi

cd $GOPATH/src/bitbucket.org/beati/$PROJECT

go run -tags=dev bundle-assets/main.go
err=$?
if [ $err -ne 0 ]; then
	exit $err
fi

cd $GOPATH/src/bitbucket.org/beati/$PROJECT/$PROJECT-server

go install -v -ldflags "-X bitbucket.org/beati/$PROJECT/$PROJECT-server/cmd.version=$(git describe --tags)"
