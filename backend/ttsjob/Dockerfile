FROM timurua/radiozilla-tts-job-base:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY ttsjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY pysrc /app/pysrc
COPY ttsjob/main.py .
COPY config/google-account.json .
COPY config/.env.docker .env

RUN mkdir -p /app/audio
VOLUME ["/app/audio"]

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["python", "main.py"]



