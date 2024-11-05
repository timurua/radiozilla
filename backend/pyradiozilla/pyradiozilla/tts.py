import threading
import nltk
import numpy as np
from pyradiozilla import storage
from pyradiozilla import audio
import soundfile
import ffmpeg

from bark.generation import (
    generate_text_semantic,
    preload_models,
)
from bark.api import semantic_to_waveform
from bark import generate_audio, SAMPLE_RATE

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
    def __convert_wav_to_ogg_opus(cls, input_wav_path, output_ogg_path):
        try:
            (
                ffmpeg
                .input(input_wav_path)
                .output(output_ogg_path, **{'c:a': 'libopus'})
                .overwrite_output()
                .run()
            )
            print(f"Conversion successful: {output_ogg_path}")
        except ffmpeg.Error as e:
            print(f"An error occurred during conversion: {e.stderr.decode()}")
        except FileNotFoundError:
            print("FFmpeg is not installed or not found in system PATH.")                
                

    @classmethod
    def generate(cls, text: str, directory: storage.Directory) -> audio.Audio:
        SPEAKER = "v2/en_speaker_6"
        silence = np.zeros(int(0.25 * SAMPLE_RATE))  # quarter second of silence
        sentences = NLTKTokenizer.tokenize(text)

        pieces = []
        for sentence in sentences:
            audio_array = generate_audio(sentence, history_prompt=SPEAKER)
            pieces += [audio_array, silence.copy()]
        
        audio_data = np.concatenate(pieces)        
        path = directory.get_timed_path("audio")
        wav_file_path = f"{path}.wav"
        soundfile.write(wav_file_path, audio_data, SAMPLE_RATE)
        ogg_file_path = f"{path}.ogg"
        cls.__convert_wav_to_ogg_opus(wav_file_path, ogg_file_path)
        txt_file_path = f"{path}.txt"
        storage.File(txt_file_path).write_json({"text": text, "sentences": sentences})
        
        return audio.Audio(wav_file_path, ogg_file_path, SAMPLE_RATE)
        
        

# Check if 'punkt' is already downloaded
