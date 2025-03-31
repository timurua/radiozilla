from typing import Set, List, Optional
import re
from dataclasses import dataclass
from bs4 import BeautifulSoup
import numpy as np
import numpy.typing as npt
from datetime import datetime

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

def extract_date_from_url(url: str) -> datetime | None:
    try:
        # Look for year between 2020-2027
        for year in range(2020, 2028):
            year_str = str(year)
            if year_str in url:
                pos = url.find(year_str) + 4
                nums = ""
                # Move right and collect up to 4 numbers
                while len(nums) < 4 and pos < len(url):                    
                    if url[pos].isalpha():
                        return None
                    if url[pos].isdigit():
                        nums += url[pos]
                    pos += 1
                    
                if len(nums) == 4:
                    month = int(nums[:2])
                    day = int(nums[2:])
                    if 1 <= month <= 12 and 1 <= day <= 31:
                        parsed_date = datetime(year, month, day)
                        if parsed_date > datetime.now():
                            return None
                        return parsed_date
        return None
    except (ValueError, IndexError):
        return None
    
    
    