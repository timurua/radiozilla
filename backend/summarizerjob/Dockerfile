# Start from the official Ollama image
FROM ollama/ollama:latest

# Download Ollama model during build (replace 'llama2' with your desired model)
RUN nohup ollama serve > /var/log/ollama.log 2>&1 & \
    sleep 5 && \
    ollama pull qwen2.5:7b && \
    pkill ollama

# Expose Ollama's default port
EXPOSE 11434

WORKDIR /app

# Install Python and pip (slim version)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY pysrc/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
    
COPY pysrc /app/pysrc

# Copy requirements first to leverage Docker cache
COPY summarizerjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY summarizerjob/main.py .
COPY summarizerjob/start.sh .
RUN chmod +x start.sh
COPY config/google-account.json .
COPY config/.env.k8s .env

# Command to run the script
ENV PYTHONPATH=/:/app
ENTRYPOINT ["/app/start.sh"]
