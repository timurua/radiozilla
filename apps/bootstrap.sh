#!/bin/bash

# Create virtual environment and install dependencies
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3.12 -m venv .venv
else
    echo "Virtual environment already exists"
fi
source .venv/bin/activate
pip install -r pysrc/requirements.txt
pip install -r scraperjob/requirements.txt
pip install -r summarizerjob/requirements.txt


