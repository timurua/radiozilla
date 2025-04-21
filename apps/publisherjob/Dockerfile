FROM gcr.io/radiozilla-92c5f/radiozilla-pysrc:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY publisherjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY publisherjob/main.py .
COPY config/google-account.json .
COPY config/.env.k8s .env
COPY resources /app/resources

RUN mkdir -p /app/audio

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["python", "main.py"]