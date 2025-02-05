from typing import Set, List, Optional
import hashlib
import re
from dataclasses import dataclass
from bs4 import BeautifulSoup
import numpy as np
import numpy.typing as npt

TEXTIFY_PATTERN = re.compile(r'[^\w]')

@dataclass
class HTMLDocument:
    """Represents an HTML document with its content and MinHash signature."""
    content: str
    minhash_signature: Optional[npt.NDArray[np.int64]] = None
    
def textify_html(html: str) -> str:
    soup = BeautifulSoup(html, 'html.parser')
    for script in soup(["script", "style"]):
        script.decompose()
        
    text = soup.get_text(separator=' ')
    text = ' '.join(text.split())
    text = re.sub(TEXTIFY_PATTERN, '', text.lower())
    return text    
    
    
    