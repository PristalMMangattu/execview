#!/usr/bin/bash

set -e
set -x

npm install

# For webview
pushd view
npm install
node ./esbuild.js

# Copy vscode-elements
mkdir -p dist/vscode-elements
cp node_modules/@vscode-elements/elements/dist/bundled.js dist/vscode-elements/

popd

vsce package
