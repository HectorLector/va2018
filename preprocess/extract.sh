#!/bin/bash

FILES="./in/*.pdf"
for f in $FILES
do
	echo "Processing file: $f"

	base=$(basename "$f" ".pdf")
	path="./out/$base/"
	
	echo "Creating dir: $base"
	mkdir -p "$path"
	
	echo "Extracting images..."
	pdfimages -png -p "$f" "$path"

	echo "Extracting meta data..."
	pdfinfo "$f" > "$path/info.txt"
	
	echo "Extracting text..."
	pdftotext "$f" "$path/data.txt"
done
