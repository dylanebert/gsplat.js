#!/bin/bash
emcc --bind wasm/wasm.cpp -Oz -o src/wasm/wasm.js \
    -s EXPORT_ES6=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME=loadWasm \
    -s EXPORTED_FUNCTIONS="[_calculateDepth, _radixSortPass, _malloc, _free]" \
    -s SINGLE_FILE=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s ENVIRONMENT=worker \
