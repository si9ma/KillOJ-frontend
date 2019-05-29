#!/bin/bash

[ "$1" != "frontend" ] && $@ && exit 0

# if not empty
# replace backend url
if [ "$BACKEND_URL" != "" ];then
    escapedURL=$(echo $BACKEND_URL | sed 's/\//\\\//g')
    for item in `find dist -type f`
    do
      sed -i 's/$BACKEND_URL/'$escapedURL'/g' $item
    done
fi

# start server
http-server -p 80 dist
