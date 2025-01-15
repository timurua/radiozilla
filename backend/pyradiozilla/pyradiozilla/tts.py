import threading
import nltk
import numpy as np
from backend.pysrc.fs import storage
import soundfile
import ffmpeg

from bark.generation import (
    generate_text_semantic,
    preload_models,
)
from bark.api import semantic_to_waveform
from bark import generate_audio, SAMPLE_RATE

class Audio:
    def __init__(self, wav_file_path: str, m4a_file_path: str, sample_rate: int) -> None:
        self.wav_file_path = wav_file_path
        self.m4a_file_path = m4a_file_path
        self.sample_rate = sample_rate

class NLTKTokenizer:
    _initialized = False
    _init_lock = threading.Lock()

    @classmethod
    def initialize(cls):
        with cls._init_lock:
            if not cls._initialized:
                try:
                    nltk.data.find('tokenizers/punkt_tab')
                except LookupError:
                    nltk.download('punkt_tab')
                cls._initialized = True

    @classmethod
    def tokenize(cls, text: str) -> list[str]:
        cls.initialize()
        sentences = nltk.sent_tokenize(text)
        return sentences


class BarkTTS:
    _initialized = False
    _init_lock = threading.Lock()
    _data = None

    @classmethod
    def initialize(cls):
        with cls._init_lock:
            if not cls._initialized:
                preload_models()
                cls._initialized = True
    
    @classmethod            
    def __convert_wav_to_m4a(cls, input_wav_path, output_m4a_path):
        try:
            (
                ffmpeg
                .input(input_wav_path)
                .output(output_m4a_path, codec='aac', audio_bitrate='128k')
                .overwrite_output()
                .run()
            )
            print(f"Conversion successful: {output_m4a_path}")
        except ffmpeg.Error as e:
            print(f"An error occurred during conversion: {e.stderr.decode()}")
        except FileNotFoundError:
            print("FFmpeg is not installed or not found in system PATH.")                
                

    @classmethod
    def generate(cls, text: str, directory: storage.Directory) -> Audio:
        cls.initialize()
        SPEAKER = "v2/en_speaker_6"
        silence = np.zeros(int(0.25 * SAMPLE_RATE))  # quarter second of silence
        sentences = NLTKTokenizer.tokenize(text)

        pieces = []
        for sentence in sentences:
            audio_array = generate_audio(sentence, history_prompt=SPEAKER)
            pieces += [audio_array, silence.copy()]
        
        audio_data = np.concatenate(pieces)        
        path = directory.get_file_path("audio")
        wav_file_path = f"{path}.wav"
        soundfile.write(wav_file_path, audio_data, SAMPLE_RATE)
        m4a_file_path = f"{path}.m4a"
        cls.__convert_wav_to_m4a(wav_file_path, m4a_file_path)
        directory.get_file("sentences.txt").write_text("\n".join(sentences))
        
        return Audio(wav_file_path, m4a_file_path, SAMPLE_RATE)
        
        

# Check if 'punkt' is already downloaded
