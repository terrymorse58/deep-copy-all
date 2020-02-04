#!/usr/bin/env bash

# build deep-copy-all for distribution
#echo -n "Making deep-copy-all index.js file with babel..."
#babel index.mjs -o index.js --plugins=@babel/plugin-transform-modules-commonjs
#echo "babel done."

echo "Building minified source files:"
gulp --gulpfile gulpfile.js
echo "Minify complete."

echo "Build complete."