FROM localhost:32000/radiozilla-pysrc:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY scraperjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY scraperjob/main.py .
COPY config/google-account.json .
COPY config/.env.k8s .env

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["python", "main.py"]