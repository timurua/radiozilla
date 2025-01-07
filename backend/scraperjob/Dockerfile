FROM python:3.12-slim as builder

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY script.py .

# Use non-root user for security
RUN useradd -m appuser
USER appuser

# Command to run the script
CMD ["python", "script.py"]