#!/bin/bash

# bootstrap.sh
set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting development environment setup...${NC}"

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python -m venv --clear venv
else
    echo -e "${YELLOW}Virtual environment already exists.${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
python -m pip install --upgrade pip

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo -e "${YELLOW}Installing dependencies from requirements.txt...${NC}"
    pip install -r requirements.txt
else
    echo -e "${YELLOW}No requirements.txt found, skipping dependencies installation${NC}"
fi

# Install the package in editable mode
echo -e "${YELLOW}Installing package in development mode...${NC}"
pip install -e .

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
FLASK_APP=wsgi.py
FLASK_ENV=development
FLASK_DEBUG=1
DATABASE_URL=sqlite:///./database.db
EOF
fi

# Initialize database
echo -e "${YELLOW}Initializing database...${NC}"
flask db upgrade || echo "No migrations found. Skipping database upgrade."

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}To activate the virtual environment, run:${NC}"
echo -e "source venv/bin/activate"

# Make the script executable
chmod +x bootstrap.sh