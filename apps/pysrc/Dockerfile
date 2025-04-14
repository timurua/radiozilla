FROM python:3.12-slim AS builder

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY pysrc/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY pysrc /app/pysrc
