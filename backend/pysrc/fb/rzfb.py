from typing import Optional
from google.cloud import firestore # type: ignore
from firebase_admin import credentials, storage, initialize_app # type: ignore
from pathlib import Path
import mimetypes
from datetime import datetime

class Firebase:
    def __init__(self, google_account_file: str) -> None:
        self._cred = credentials.Certificate(google_account_file)
        initialize_app(self._cred, {
            'storageBucket': "radiozilla-92c5f.firebasestorage.app",
        })
        self._db = firestore.Client.from_service_account_json(google_account_file)
        self._bucket = storage.bucket()
        
    def upload_file(self, remote_directory: str, remote_file_name: str, local_file_path: str):
        mime_type, _ = mimetypes.guess_type(local_file_path)
        content_type = mime_type if mime_type else 'application/octet-stream'
        blob = self._bucket.blob(f"{remote_directory}/{remote_file_name}{Path(local_file_path).suffix}")
        blob.upload_from_filename(local_file_path, content_type=content_type)
        blob.make_public()
        gs_url = f'gs://{self._bucket.name}/{blob.name}'
        return gs_url
    
    def file_blob(self, file_path: str):
        return Blob(file_path=file_path)
    
class Blob:
    def __init__(self, *, url: Optional[str] = None, file_path: Optional[str] = None) -> None:
        self.url = url
        self.file_path = file_path
        
    def upload(self, firebase: Firebase, remote_directory: str, remote_file_name: str):
        if self.url is None and self.file_path is not None:
            self.url = firebase.upload_file(remote_directory, remote_file_name, self.file_path)
        return self.url
        

        
class RzAuthor:
    def __init__(self, id: str, name: str, description: str, image: Blob) -> None:
        self.id = id
        self.name = name
        self.description = description
        self.image = image

    def save(self, firebase: Firebase):
        firebase._db.collection('authors').document(self.id).set({
            'name': self.name,
            'description': self.description,
            'imageUrl': self.image.url,
        })
        
    def upload_and_save(self, firebase: Firebase):
        self.image.upload(firebase, "author_images", self.id)
        self.save(firebase)
        
class RzChannel:
    def __init__(self, id: str, name: str, description: str, image_url: str, image: Blob | None = None, source_urls: list[str] = []) -> None:
        self.id = id
        self.name = name
        self.description = description
        self.image_url = image_url
        self.image = image
        self.source_urls = source_urls
        
    def save(self, firebase: Firebase):
        firebase._db.collection('channels').document(self.id).set({
            'name': self.name,
            'description': self.description,
            'imageUrl': self.image.url if self.image is not None else self.image_url,
            'sourceUrls': self.source_urls,
        })
        
    def upload_and_save(self, firebase: Firebase):
        if self.image:
            self.image.upload(firebase, "channel_images", self.id)
        self.save(firebase)                
            
class RzAudio:
    def __init__(self, id: str, author_id: str, channel_id: str, name: str, description: str, audio_text: str, audio: Blob, image_url: str | None, image: Blob | None = None, topics: list[str] = [], duration_seconds: int | None = None, web_url: str | None = None, published_at: datetime | None = None, uploaded_at: datetime | None = None ) -> None:
        self.id = id
        self.created_at = firestore.SERVER_TIMESTAMP
        self.author_id = author_id
        self.channel_id = channel_id
        self.name = name
        self.description = description
        self.audio = audio
        self.image = image
        self.image_url = image_url
        self.topics = topics
        self.duration_seconds = duration_seconds
        self.web_url = web_url
        self.published_at = published_at
        self.uploaded_at = uploaded_at
        self.audio_text = audio_text
        
    def save(self, firebase: Firebase):
        firebase._db.collection('audios').document(self.id).set({
            'createdAt': self.created_at,
            'author':  f"{self.author_id}",
            'channel': f"{self.channel_id}",
            'name': self.name,
            'description': self.description,
            'audioUrl': self.audio.url if self.audio is not None else None,
            'imageUrl': self.image_url if self.image is None else self.image.url,
            'topics': self.topics,
            'durationSeconds': self.duration_seconds,
            'webUrl': self.web_url,
            'publishedAt': self.published_at,
            'uploadedAt': self.uploaded_at,
            'audioText': self.audio_text
        })
        
    def upload_and_save(self, firebase: Firebase):
        self.audio.upload(firebase, "audio_media", self.id)
        if self.image:
            self.image.upload(firebase, "audio_images", self.id)
        self.save(firebase)
        
    @classmethod
    def delete(cls, firebase: Firebase, id: str) -> None:
        firebase._db.collection('audios').document(id).delete()
        

