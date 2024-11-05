from pyradiozilla import storage
from pyradiozilla import audio

class Cloud:
    def __init__(self, name: str, audio: audio.Audio) -> None:
        self.audio = audio
        
    def save(self):
        
