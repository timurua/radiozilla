#!/bin/bash

export PYTHONPATH=..:.:$PYTHONPATH
export ENV_FILE=config/.env.local.gcp


# Start the application
uvicorn apiservice.backend.main:app --reload --host 0.0.0.0 --port 8000
