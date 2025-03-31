#!/bin/bash

export PYTHONPATH=.:$PYTHONPATH
export ENV_FILE=config/.env.local


# Start the application
uvicorn apiservice.backend.main:app --host 0.0.0.0 --port 8000
