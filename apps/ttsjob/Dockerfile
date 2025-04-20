FROM gcr.io/radiozilla-92c5f/radiozilla-ttsjob-base:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY ttsjob/requirements.txt .
COPY pysrc/requirements.txt /app/pysrc/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt -r pysrc/requirements.txt

COPY pysrc /app/pysrc

COPY ttsjob /app/ttsjob
COPY config/google-account.json config/google-account.json
COPY config/.env.prod.gcp .env

COPY resources/audio_refs /app/audio_refs

RUN mkdir -p /app/audio
VOLUME ["/app/audio"]

# Command to run the script
ENV PYTHONPATH=/:/app
ENV PYTHONPATH=/:/app:/app/ttsjob
CMD ["python", "-m", "ttsjob.main"]



