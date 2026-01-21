#!/usr/bin/bash

npm install

# For webview
pushd view
npm install
node ./esbuild.js

cp src/*.html src/*.css dist/
popd

vsce package