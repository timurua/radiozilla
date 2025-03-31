from minio import Minio
from minio.error import MinioException
import os
import asyncio
from typing import Optional

class MinioClient:
    def __init__(self, endpoint: str, access_key: str, secret_key: str, secure: bool = False):
        """Initialize MinIO client with credentials."""
        self.client = Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure
        )

    def get_presigned_url(self, bucket_name: str, object_name: str) -> str:
        """Get the URL for an object in MinIO."""
        return self.client.presigned_get_object(bucket_name, object_name)

    async def upload_file(
        self,
        bucket_name: str,
        file_path: str,
        object_name: Optional[str] = None
    ) -> bool:
        """
        Asynchronously upload a file to MinIO.
        
        Args:
            bucket_name: Name of the bucket
            file_path: Path to the file to upload
            object_name: Name to give the object in MinIO (defaults to file name)
        
        Returns:
            bool: True if upload successful, False otherwise
        """
        try:
            # Create bucket if it doesn't exist
            if not await self._bucket_exists(bucket_name):
                await self._create_bucket(bucket_name)

            # If no object name specified, use the file name
            if object_name is None:
                object_name = os.path.basename(file_path)

            # Run the upload in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                self.client.fput_object,
                bucket_name,
                object_name,
                file_path
            )
            return True

        except MinioException as e:
            print(f"Error uploading file: {e}")
            return False

    async def _bucket_exists(self, bucket_name: str) -> bool:
        """Check if bucket exists."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self.client.bucket_exists,
            bucket_name
        )

    async def _create_bucket(self, bucket_name: str) -> None:
        """Create a new bucket."""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            self.client.make_bucket,
            bucket_name
        )

    async def download_file(
        self,
        bucket_name: str,
        object_name: str,
        file_path: str
    ) -> bool:
        """
        Asynchronously download a file from MinIO.
        
        Args:
            bucket_name: Name of the bucket
            object_name: Name of the object in MinIO
            file_path: Path where to save the downloaded file
        
        Returns:
            bool: True if download successful, False otherwise
        """
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                self.client.fget_object,
                bucket_name,
                object_name,
                file_path
            )
            return True
        except MinioException as e:
            print(f"Error downloading file: {e}")
            return False
