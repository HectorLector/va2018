#!/bin/bash

DIRS=./out/

echo "Processing dir: $DIRS"
./node/bin/node app.js "$DIRS"

#for f in $DIRS
#do
#	echo "Processing dir: $f"
#	#d="$f/data.txt"
#	#nodejs app.js "$d"
#	./node/bin/node app.js "$f" "$(basename "$f").pdf"
#done

