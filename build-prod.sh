#!/bin/sh

PROJECT=exchart

cd $PROJECT-client

export MSYS2_ARG_CONV_EXCL="/static/"
ng build --aot --prod --deploy-url /static/
err=$?
if [ $err -ne 0 ]; then
	exit $err
fi

cd ..

go run -tags=dev $PROJECT-server/assets/bundle/main.go
err=$?
if [ $err -ne 0 ]; then
	exit $err
fi

cd $PROJECT-server

GOOS=linux GOARCH=amd64 go install -v -ldflags "-X github.com/beati/$PROJECT/$PROJECT-server/cmd.version=$(git describe --tags)"
