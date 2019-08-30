#!/bin/sh

PROJECT=exchart

cd $PROJECT-client

export MSYS2_ARG_CONV_EXCL="/static/"
ng build --watch --aot --deploy-url /static/
