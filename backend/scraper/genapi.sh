#!/bin/bash

curl -o openapi.json http://localhost:8001/openapi.json && openapi-generator-cli generate \
  -i ./openapi.json \
  -g typescript-axios \
  -o ./ui/src/api