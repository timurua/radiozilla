FROM localhost:32000/radiozilla-ttsjob-base:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY ttsjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY pysrc /app/pysrc
COPY ttsjob/main.py .
COPY config/google-account.json .
COPY config/.env.k8s .env

COPY resources/audio_refs /app/audio_refs

RUN mkdir -p /app/audio
VOLUME ["/app/audio"]

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["python", "main.py"]



