#!/usr/bin/bash

npm install
node ./esbuild.js

cp src/*.html dist/
