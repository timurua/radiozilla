FROM localhost:32000/radiozilla-pysrc:latest

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY apiservice/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the script
COPY apiservice/backend /app/backend
COPY apiservice/ui/dist /app/ui/dist
COPY config/google-account.json .
COPY config/.env.k8s .env

# Command to run the script
ENV PYTHONPATH=/:/app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]