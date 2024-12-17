from minio import Minio
from minio.error import S3Error
from typing import Optional
from ..config import settings

class MinioService:
    def __init__(self, config):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY_ID,
            secret_key=settings.MINIO_SECRET_ACCESS_KEY,
            secure=settings.MINIO_USE_SSL
        )
        self.default_bucket = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Ensure the default bucket exists."""
        try:
            if not self.client.bucket_exists(self.default_bucket):
                self.client.make_bucket(self.default_bucket)
        except S3Error as e:
            raise Exception(f"Failed to initialize Minio bucket: {str(e)}")

    def upload_file(self, file_path: str, object_name: str) -> bool:
        """Upload a file to Minio storage."""
        try:
            self.client.fput_object(self.default_bucket, object_name, file_path)
            return True
        except S3Error as e:
            print(f"Error uploading file: {str(e)}")
            return False

    def download_file(self, object_name: str, file_path: str) -> bool:
        """Download a file from Minio storage."""
        try:
            self.client.fget_object(self.default_bucket, object_name, file_path)
            return True
        except S3Error as e:
            print(f"Error downloading file: {str(e)}")
            return False

    def get_file_url(self, object_name: str, expires: int = 7200) -> Optional[str]:
        """Get a presigned URL for an object."""
        try:
            return self.client.presigned_get_object(
                self.default_bucket, object_name, expires=expires
            )
        except S3Error as e:
            print(f"Error generating presigned URL: {str(e)}")
            return None