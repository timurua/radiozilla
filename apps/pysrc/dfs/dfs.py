from typing import Optional
from ..fb import rzfb
from ..config.rzconfig import RzConfig

WEB_IMAGES = "web_images"
FRONTEND_IMAGES = "frontend_images"
WEB_PAGES_CONTENT = "web_pages_content"
AUTHOR_IMAGES = "author_images"
CHANNEL_IMAGES = "channel_images"
AUDIO_FILES = "audio_files"

class DFSClient:
    def __init__(self, config: RzConfig):
        """Initialize MinIO client with credentials."""
        self._config = config

    def __get_bucket_name(self, bucket_name: str) -> str:
        """Get the bucket name with prefix."""
        return f"{self._config.dfs_bucket_prefix}_{bucket_name}"

    async def upload_file(
        self,
        bucket_name: str,        
        object_name: str,
        file_path: str,
    ) -> str:
        full_bucket_name = self.__get_bucket_name(bucket_name)
        await rzfb.Firebase.instance().upload_file(
            remote_directory=full_bucket_name,
            remote_file_name=object_name,
            local_file_path=file_path
        )
        return f'gs://{full_bucket_name}/{object_name}'
    
    async def upload_buffer(
        self,
        bucket_name: str,
        object_name: str,
        buffer: bytes,
    ) -> str:
        full_bucket_name = self.__get_bucket_name(bucket_name)
        await rzfb.Firebase.instance().upload_buffer(
            remote_directory=full_bucket_name,
            remote_file_name=object_name,
            buffer=buffer
        )
        return f'gs://{full_bucket_name}/{object_name}'

    
    async def download_file(
        self,
        bucket_name: str,
        object_name: str,
        file_path: str
    ) -> bool:
        await rzfb.Firebase.instance().download_file(
            remote_directory=self.__get_bucket_name(bucket_name),
            remote_file_name=object_name,
            local_file_path=file_path
        )
        return True
    
    async def download_buffer(
        self,
        bucket_name: str,
        object_name: str,
    ) -> bytes:
        buffer = await rzfb.Firebase.instance().download_buffer(
            remote_directory=self.__get_bucket_name(bucket_name),
            remote_file_name=object_name,
        )
        return buffer