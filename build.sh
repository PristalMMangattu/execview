#!/usr/bin/bash

npm install

# For webview
pushd view
npm install
node ./esbuild.js

cp src/*.html dist/
popd

vsce package