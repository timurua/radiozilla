#!/bin/bash

export PYTHONPATH=$PYTHONPATH:$(pwd)/../pywebscraper

# Start the application
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001