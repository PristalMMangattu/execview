#!/usr/bin/bash

npm install

# For webview
pushd view
npm install
node ./esbuild.js

cp src/*.html src/*.css dist/

# Copy vscode-elements
mkdir -p dist/vscode-elements
cp node_modules/@vscode-elements/elements/dist/bundled.js dist/vscode-elements/

popd

vsce package