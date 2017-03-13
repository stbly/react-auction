#!/bin/sh
BASEDIR=`dirname $0`/../

if [ -n "$1" ]; then
    SERVER=$1
else
    SERVER='0.0.0.0:8000'
fi

. $BASEDIR/env/bin/activate
$BASEDIR/env/bin/python $BASEDIR/project/manage.py runserver --traceback $SERVER
