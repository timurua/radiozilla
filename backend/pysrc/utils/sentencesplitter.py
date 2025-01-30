from typing import List
import nltk
from nltk.tokenize import sent_tokenize

class SentenceSplitter:
    def __init__(self) -> None:        
        try:
            nltk.data.find('tokenizers/punkt_tab')
        except LookupError:
            nltk.download('punkt_tab')

    def split_sentences(self, text: str) -> List[str]:     
        if not text.strip():
            return []
            
        return sent_tokenize(text)
