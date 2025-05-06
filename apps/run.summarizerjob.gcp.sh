#!/bin/bash

export PYTHONPATH=..:.:$PYTHONPATH
export ENV_FILE=config/.env.local.gcp


# Start the application
python -m summarizerjob.main
