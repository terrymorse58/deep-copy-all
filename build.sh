#!/usr/bin/env bash

echo "Making browser version with browserify:"
browserify index.js --detect-globals false --standalone deepCopy \
          -o ./deep-copy-all.js
echo "Browserify complete."


echo "Building minified source files:"
gulp --gulpfile gulpfile.js
echo "Minify complete."

echo "Build complete."