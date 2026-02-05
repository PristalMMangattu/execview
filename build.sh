#!/usr/bin/bash

set -e
set -x

npm install

# For webview
pushd view
npm install
node ./esbuild.js

popd

vsce package
