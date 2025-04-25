FROM gcr.io/radiozilla-92c5f/radiozilla-pysrc:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY scraperjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY scraperjob/main.py .
COPY config/google-account.json .
COPY config/.env.k8s .env

# Copy the backend and config files
COPY scraperjob /app/scraperjob
COPY config/google-account.json config/google-account.json
COPY config/.env.prod.gcp .env

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["python", "-m", "scraperjob.main"]