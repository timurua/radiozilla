FROM pysrc:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY scraperjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY scraperjob/main.py .
COPY scraperjob/google-account.json .
COPY scraperjob/.env .

# Use non-root user for security
RUN useradd -m appuser
USER appuser

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["python", "main.py"]