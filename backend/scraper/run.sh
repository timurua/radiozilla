#!/bin/bash

export PYTHONPATH=$PYTHONPATH:$(pwd)/../pywebscraper:$(pwd)/../pyradiozilla

# Remove existing .env if it exists
rm -f .env

# Create hard link from .env.local to .env
ln -s .env.local .env

# Start the application
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001