# Docker Compose

```
docker compose build --push
```

# Cloud run

```
gcloud run deploy python-http-service \
  --image gcr.io/YOUR_PROJECT_ID/python-http-server \
  --platform managed \
  --allow-unauthenticated \
  --region us-central1 \
  --set-env-vars="DATABASE_URL=postgres://user:pass@host:port/db"
```
