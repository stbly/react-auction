#!/bin/sh
BASEDIR=`dirname $0`

install_requirements()
{
    installed=1
    # Run with a clean environment so this works when
    # running inside of a post-receive hook
    env -i "PATH=$PATH" "$BASEDIR/../env/bin/pip" install --upgrade -i "https://pypi.python.org/simple" -r "$BASEDIR/../deploy/requirements/$1.txt"
    installed=$?
    if [ $installed -eq 1 ]; then
            echo "Could not install all $1 requirements"
    fi
}

if [ ! -d "$BASEDIR/../env" ]; then
    virtualenv --system-site-packages "$BASEDIR/../env"
    if [ $? -ne 0 ]; then
        echo "Trying without system-site-packages"
        virtualenv "$BASEDIR/../env"
    fi
fi

if [ $? -eq 0 ]; then
    install_requirements "base"
    for var in "$@"
    do
        v="$BASEDIR/../deploy/requirements/$var.txt"
        if [ -f $v ]; then
            install_requirements $var
        fi
    done
fi
