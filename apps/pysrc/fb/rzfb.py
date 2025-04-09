from concurrent.futures import ThreadPoolExecutor
from google.cloud import firestore # type: ignore
from firebase_admin import credentials, storage, initialize_app # type: ignore
import mimetypes
import asyncio
import logging

from pysrc.config.rzconfig import RzConfig

executor = ThreadPoolExecutor(max_workers=4)

class Firebase:

    __firebase = None

    def __init__(self, config: RzConfig) -> None:
        self._cred = credentials.Certificate(config.google_account_file)
        initialize_app(self._cred, {
            'storageBucket': "radiozilla-92c5f.firebasestorage.app",
        })
        self._db = firestore.Client.from_service_account_json(config.google_account_file)
        self._bucket = storage.bucket()

    @classmethod
    def instance(cls) -> 'Firebase':
        if cls.__firebase is None:
            cls.__firebase = Firebase(RzConfig.instance())
        return cls.__firebase
        
    async def upload_file(self, remote_directory: str, remote_file_name: str, local_file_path: str) -> str:

        def synchronous_worker() -> str:  
            mime_type, _ = mimetypes.guess_type(local_file_path)
            content_type = mime_type if mime_type else 'application/octet-stream'
            blob = self._bucket.blob(f"{remote_directory}/{remote_file_name}")
            blob.upload_from_filename(local_file_path, content_type=content_type)
            blob.make_public()
            gs_url = f'gs://{self._bucket.name}/{blob.name}'
            return gs_url
        
        gs_url = await asyncio.get_event_loop().run_in_executor(executor, synchronous_worker)
        return gs_url
    
    
    async def upload_buffer(self, remote_directory: str, remote_file_name: str, buffer: bytes, mime_type: None|str = None) -> str:                
        def synchronous_worker() -> str:
            content_type = mime_type if mime_type else 'application/octet-stream'
            blob = self._bucket.blob(f"{remote_directory}/{remote_file_name}")
            blob.upload_from_string(buffer, content_type=content_type)
            blob.make_public()
            gs_url = f'gs://{self._bucket.name}/{blob.name}'
            return gs_url    
    
        gs_url = await asyncio.get_event_loop().run_in_executor(executor, synchronous_worker)
        return gs_url
    
    async def download_file(self, remote_directory: str, remote_file_name: str, local_file_path: str) -> str:
        def synchronous_worker() -> str:
            blob = self._bucket.blob(f"{remote_directory}/{remote_file_name}")
            blob.download_to_filename(local_file_path)
            gs_url = f'gs://{self._bucket.name}/{blob.name}'
            return gs_url    
        
        gs_url = await asyncio.get_event_loop().run_in_executor(executor, synchronous_worker)
        return gs_url
    
    async def download_buffer(self, remote_directory: str, remote_file_name: str) -> bytes:
        def synchronous_worker() -> bytes:
            blob = self._bucket.blob(f"{remote_directory}/{remote_file_name}")
            return blob.download_as_bytes()
        buffer = await asyncio.get_event_loop().run_in_executor(executor, synchronous_worker)
        return buffer
        

    
