FROM pysrc:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY publisherjob/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY publisherjob/main.py .
COPY publisherjob/google-account.json .
COPY publisherjob/.env .

# Use non-root user for security
RUN useradd -m appuser
USER appuser

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["python", "main.py"]