from typing import Optional
from google.cloud import firestore
import firebase_admin
from firebase_admin import credentials
from firebase_admin import storage
import base64
import uuid
import hashlib
from pathlib import Path
import mimetypes

class Firebase:
    def __init__(self) -> None:
        self._cred = credentials.Certificate("firestore_service_account.json")
        firebase_admin.initialize_app(self._cred, {
            'storageBucket': "radiozilla-92c5f.firebasestorage.app",
        })
        self._db = firestore.Client.from_service_account_json("firestore_service_account.json")
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
        if self.url is None:
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
    def __init__(self, id: str, name: str, description: str, image: Blob, source_urls: list[str] = []) -> None:
        self.id = id
        self.name = name
        self.description = description
        self.image = image
        self.source_urls = source_urls
        
    def save(self, firebase: Firebase):
        firebase._db.collection('channels').document(self.id).set({
            'name': self.name,
            'description': self.description,
            'imageUrl': self.image.url,
            'sourceUrls': self.source_urls,
        })
        
    def upload_and_save(self, firebase: Firebase):
        self.image.upload(firebase, "channel_images", self.id)
        self.save(firebase)                
            
class RzAudio:
    def __init__(self, id: str, author_id: str, channel_id: str, name: str, description: str, audio: Blob, image: Blob, topics: list[str] = []) -> None:
        self.id = id
        self.created_at = firestore.SERVER_TIMESTAMP
        self.author_id = author_id
        self.channel_id = channel_id
        self.name = name
        self.description = description
        self.audio = audio
        self.image = image
        self.topics = topics
        
    def save(self, firebase: Firebase):
        firebase._db.collection('audios').document(self.id).set({
            'createdAt': self.created_at,
            'author':  f"/authors/{self.author_id}",
            'channel': f"/channels/{self.channel_id}",
            'name': self.name,
            'description': self.description,
            'audioUrl': self.audio.url,
            'imageUrl': self.image.url,
            'topics': self.topics,
        })
        
    def upload_and_save(self, firebase: Firebase):
        self.audio.upload(firebase, "audio_media", self.id)
        self.image.upload(firebase, "audio_images", self.id)
        self.save(firebase)        
        

