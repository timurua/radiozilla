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

        
