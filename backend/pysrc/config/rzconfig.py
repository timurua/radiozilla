import os
from dotenv import load_dotenv

class RzConfig:
    def __init__(self):
        env_path = os.getenv('ENV_FILE', '.env')
        load_dotenv(env_path)

        self.env_name = os.getenv('ENV_NAME', 'unknown')
        self.service_name = os.getenv('SERVICE_NAME', 'unknown')
        self.db_url = os.getenv('DB_URL', 'unknown')
        self.google_account_file = os.getenv('GOOGLE_ACCOUNT_FILE', 'unknown')
        self.audio_dir = os.getenv('AUDIO_DIR', 'unknown')
        self.image_resource_dir = os.getenv('IMAGE_RESOURCE_DIR', 'unknown')

        
        self.minio_endpoint = os.getenv('MINIO_ENDPOINT', 'unknown')
        self.minio_access_key = os.getenv('MINIO_ACCESS_KEY', 'unknown')
        self.minio_secret_key = os.getenv('MINIO_SECRET_KEY', 'unknown')
        self.minio_tenant = os.getenv('MINIO_TENANT', 'unknown')
        self.minio_bucket = os.getenv('MINIO_BUCKET', 'unknown')