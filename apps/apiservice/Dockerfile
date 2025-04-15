FROM gcr.io/radiozilla-92c5f/radiozilla-pysrc:latest AS base

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY apiservice/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Add Node.js for building React app
FROM node:20-slim AS ui-builder
WORKDIR /app/ui
COPY apiservice/ui/package*.json ./
RUN npm ci
COPY apiservice/ui/ .
RUN npm run build

# Back to base image
FROM base
WORKDIR /app

# Copy the built UI from the ui-builder stage
COPY --from=ui-builder /app/ui/dist /app/apiservice/ui/dist

# Copy the backend and config files
COPY apiservice/backend /app/apiservice/backend
COPY config/google-account.json config/google-account.json
COPY config/.env.prod.gcp .env

# Command to run the script
ENV PYTHONPATH=/:/app:/app/apiservice
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]