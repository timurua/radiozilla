from typing import Set, List, Optional
import hashlib
from dataclasses import dataclass
import numpy as np
import numpy.typing as npt
from .text import textify_html, HTMLDocument

class MinHasher:
    def __init__(self, num_permutations: int = 256):
        self.num_permutations = num_permutations
        # Generate random hash functions
        self.hash_seeds = np.random.randint(0, 2**32, size=num_permutations)
       
    def _get_shingles(self, text: str, k: int = 3) -> Set[str]:
        return set(text[i:i+k] for i in range(len(text) - k + 1))
    
    def _min_hash(self, shingles: Set[str]) -> npt.NDArray[np.int64]:
        max_int64 = np.iinfo(np.int64).max
        signature = np.full(self.num_permutations, max_int64, dtype=np.int64)
        
        for shingle in shingles:
            hash_vals = np.frombuffer(
                np.array([
                    hashlib.sha1(f"{seed}:{shingle}".encode()).digest()[:8]
                    for seed in self.hash_seeds
                ], dtype=np.bytes_),
                dtype=np.int64
            )
            
            signature = np.minimum(signature, hash_vals)
        
        return signature
    
    def compute_signature(self, html: str) -> HTMLDocument:
        processed_text = textify_html(html)
        shingles = self._get_shingles(processed_text)
        signature = self._min_hash(shingles)
        return HTMLDocument(html, signature)
    
    @staticmethod
    def estimate_similarity(doc1: HTMLDocument, doc2: HTMLDocument) -> float:
        if doc1.minhash_signature is None or doc2.minhash_signature is None:
            raise ValueError("Documents must have computed signatures")
            
        return np.mean(doc1.minhash_signature == doc2.minhash_signature)
    