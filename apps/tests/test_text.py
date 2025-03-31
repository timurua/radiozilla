from datetime import datetime
import pytest
from pysrc.scraper.text import extract_date_from_url

@pytest.mark.parametrize("url, expected", [
    # Valid dates
    ("https://example.com/post-2023-12-25", datetime(2023, 12, 25)),
    ("http://blog.com/article-2020-01-01", datetime(2020, 1, 1)),
    ("https://news.com/story-2024-02-29", datetime(2024, 2, 29)),
    
    # Invalid formats
    ("https://example.com/no-date", None),
    ("https://example.com/2023/12/25", datetime(2023, 12, 25)),
    ("https://example.com/post-202312-25", datetime(2023, 12, 25)),
    
    # Invalid dates
    ("https://example.com/post-2023-13-45", None),
    ("https://example.com/post-2023-00-01", None),
    ("https://example.com/post-2023-04-31", None),
    
    # Edge cases
    ("", None),
    ("2023-12-25", datetime(2023, 12, 25)),
    ("post-2023-12-25", datetime(2023, 12, 25)),
])
def test_extract_date_from_url(url: str, expected: datetime | None) -> None:
    """Test URL date extraction with various formats."""
    result = extract_date_from_url(url)
    assert result == expected