class Audio:
    def __init__(self, wav_file_path: str, ogg_file_path: str, sample_rate: int) -> None:
        self.wav_file_path = wav_file_path
        self.ogg_file_path = ogg_file_path
        self.sample_rate = sample_rate