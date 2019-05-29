#!/bin/bash

[ "$1" != "frontend" ] && $@ && exit 0

cd /usr/share/nginx/html

# if not empty
# replace backend url
if [ "$BACKEND_URL" != "" ];then
    escapedURL=$(echo $BACKEND_URL | sed 's/\//\\\//g')
    for item in `find . -type f`
    do
      sed -i 's/$BACKEND_URL/'$escapedURL'/g' $item
    done
fi

# start server
nginx -g "daemon off;"