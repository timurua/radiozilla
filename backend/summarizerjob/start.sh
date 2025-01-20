#!/bin/bash

# Start Ollama in the background
ollama serve &

# Wait for Ollama to fully start
sleep 10

# Start Python application and store its PID
python3 main.py