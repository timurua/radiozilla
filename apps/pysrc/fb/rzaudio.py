from pysrc.dfs.dfs import AUTHOR_IMAGES, CHANNEL_IMAGES, WEB_IMAGES
from pysrc.fb.rzfb import Firebase
from google.cloud import firestore # type: ignore


class PngImage:
    def __init__(self, *, id: str, png_buffer: bytes ) -> None:
        self.id = id
        self.png_buffer = png_buffer
        
    async def upload(self, firebase: Firebase) -> str:
        mime_type = "image/png"        
        self.url = await firebase.upload_buffer(WEB_IMAGES, self.id, self.png_buffer, mime_type)
        return self.url

        
class RzAuthor:
    def __init__(self, id: str, name: str, description: str, image: PngImage) -> None:
        self.id = id
        self.name = name
        self.description = description
        self.image = image

    def save(self, firebase: Firebase) -> None:
        firebase._db.collection('authors').document(self.id).set({
            'name': self.name,
            'description': self.description,
            'imageUrl': self.image.url,
        })
        
    async def upload_and_save(self, firebase: Firebase) -> None:
        await self.image.upload(firebase)
        self.save(firebase)
        
class RzChannel:
    def __init__(self, id: str, name: str, description: str, image_url: str, image: PngImage | None = None, source_urls: list[str] = []) -> None:
        self.id = id
        self.name = name
        self.description = description
        self.image_url = image_url
        self.image = image
        self.source_urls = source_urls
        
    def save(self, firebase: Firebase) -> None:
        firebase._db.collection('channels').document(self.id).set({
            'name': self.name,
            'description': self.description,
            'imageUrl': self.image.url if self.image is not None else self.image_url,
            'sourceUrls': self.source_urls,
        })
        
    async def upload_and_save(self, firebase: Firebase) -> None:
        if self.image:
            await self.image.upload(firebase)
        self.save(firebase)                
            
class RzAudio:
    def __init__(self, id: str, author_id: str, channel_id: str, name: str, description: str, audio_text: str, audio: Blob, image_url: str | None, image: PngImage | None = None, topics: list[str] = [], duration_seconds: int | None = None, web_url: str | None = None, published_at: datetime | None = None, uploaded_at: datetime | None = None ) -> None:
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
        
    def save(self, firebase: Firebase) -> None:
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
        
    def upload_and_save(self, firebase: Firebase) -> None:
        self.audio.upload(firebase, "audio_media", self.id)
        if self.image:
            self.image_url = self.image.upload(firebase)
        self.save(firebase)
        
    @classmethod
    def delete(cls, firebase: Firebase, id: str) -> None:
        firebase._db.collection('audios').document(id).delete()
        

