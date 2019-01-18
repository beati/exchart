#!/bin/sh

PROJECT=budget

cd $GOPATH/src/bitbucket.org/beati/$PROJECT/$PROJECT-client

export MSYS2_ARG_CONV_EXCL="/static/"
ng build --watch --aot --deploy-url /static/
