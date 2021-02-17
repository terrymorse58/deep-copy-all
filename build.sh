#!/usr/bin/env bash

echo "Copying files to dist:"
cp -v ./src/deepCopyAll.js ./dist/deepCopyAll.js
cp -v ./src/dca-library.js ./dist/dca-library.js

echo "Making browser version of deepCopyAll.js with browserify:"
browserify ./src/deepCopyAll.js --detect-globals false --standalone deepCopy \
          -o ./dist/deepCopyAll.browser.js
echo "Build index.browser.js complete."

echo "Building minified source files:"
gulp --gulpfile gulpfile.js
echo "Minify complete."

echo "Build complete."
