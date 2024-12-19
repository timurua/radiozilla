#!/bin/bash

# Create virtual environment and install dependencies
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3.12 -m venv .venv
else
    echo "Virtual environment already exists"
fi
source .venv/bin/activate
pip install -e .

# Start PostgreSQL using Docker
(cd ../postgres && docker-compose up -d)

# Install frontend dependencies and build
cd ui
npm install
npm run build
cd ..

# Run database migrations (assuming you're using alembic)
# alembic upgrade head

source ./run.sh
