from typing import List, Tuple
import pytest
import numpy as np
from bs4 import BeautifulSoup
from pysrc.scraper.minhash import MinHasher, HTMLDocument  # Assuming previous code is in minhash.py
from pysrc.scraper.text import textify_html

@pytest.fixture
def minhash() -> MinHasher:
    """Fixture to create a MinHasher instance with fixed seed for reproducibility."""
    np.random.seed(42)  # Fix random seed for consistent test results
    return MinHasher(num_permutations=100)

@pytest.fixture
def sample_documents() -> List[Tuple[str, str, float]]:
    """
    Fixture providing test cases with HTML pairs and expected similarity.
    Returns list of (doc1, doc2, expected_similarity) tuples.
    """
    return [
        # Identical documents
        (
            "<html><body><h1>Test</h1><p>Content</p></body></html>",
            "<html><body><h1>Test</h1><p>Content</p></body></html>",
            1.0
        ),
        # Minor changes (whitespace, formatting)
        (
            "<html><body><h1>Test</h1><p>Content</p></body></html>",
            "<html><body>\n    <h1>Test</h1>\n    <p>Content</p>\n</body></html>",
            1.0
        ),
        # Small content change
        (
            "<html><body><h1>Test</h1><p>Content</p></body></html>",
            "<html><body><h1>Test</h1><p>Content Updated</p></body></html>",
            0.6
        ),
        # Major content change
        (
            "<html><body><h1>Test</h1><p>Original content here</p></body></html>",
            "<html><body><h1>Different</h1><p>Completely new content</p></body></html>",
            0.3
        ),
        # Empty documents
        (
            "",
            "",
            1.0
        )
    ]

def test_init_minhash() -> None:
    """Test MinHasher initialization with different parameters."""
    minhash = MinHasher(num_permutations=50)
    assert minhash.num_permutations == 50
    assert len(minhash.hash_seeds) == 50

def test_preprocess_html(minhash: MinHasher) -> None:
    """Test HTML preprocessing functionality."""
    html = """
    <html>
        <head>
            <script>console.log('test');</script>
            <style>.test { color: red; }</style>
        </head>
        <body>
            <h1>Test Title</h1>
            <p>Test content!</p>
        </body>
    </html>
    """
    processed = textify_html(html)
    
    # Check if scripts and styles are removed
    assert "console.log" not in processed
    assert "color: red" not in processed
    
    # Check if content is preserved and normalized
    assert "testtitle" in processed.lower()
    assert "testcontent" in processed.lower()

def test_get_shingles(minhash: MinHasher) -> None:
    """Test k-shingle generation."""
    text = "test text"
    shingles = minhash._get_shingles(text, k=3)
    
    expected_shingles = {"tes", "est", "st ", "t t", " te", "tex", "ext"}
    assert shingles == expected_shingles

def test_compute_signature(minhash: MinHasher) -> None:
    """Test signature computation."""
    html = "<html><body><h1>Test</h1></body></html>"
    doc = minhash.compute_signature(html)
    
    assert isinstance(doc, HTMLDocument)
    assert doc.content == html
    assert doc.minhash_signature is not None
    assert len(doc.minhash_signature) == minhash.num_permutations
    assert doc.minhash_signature.dtype == np.int64

def test_signature_consistency(minhash: MinHasher) -> None:
    """Test if same input produces same signature."""
    html = "<html><body><h1>Test</h1></body></html>"
    doc1 = minhash.compute_signature(html)
    doc2 = minhash.compute_signature(html)
    
    np.testing.assert_array_equal(doc1.minhash_signature, doc2.minhash_signature)

def test_similarity_estimation(
    minhash: MinHasher,
    sample_documents: List[Tuple[str, str, float]]
) -> None:
    """Test similarity estimation with various document pairs."""
    for doc1_html, doc2_html, expected_similarity in sample_documents:
        doc1 = minhash.compute_signature(doc1_html)
        doc2 = minhash.compute_signature(doc2_html)
        
        similarity = minhash.estimate_similarity(doc1, doc2)
        # Allow for some variance in estimation
        assert abs(similarity - expected_similarity) < 0.2

def test_edge_cases(minhash: MinHasher) -> None:
    """Test edge cases and error handling."""
    # Test with empty documents
    empty_doc1 = minhash.compute_signature("")
    empty_doc2 = minhash.compute_signature("")
    assert minhash.estimate_similarity(empty_doc1, empty_doc2) == 1.0
    
    # Test with very large documents
    large_html = "<p>Content</p>" * 1000
    doc1 = minhash.compute_signature(large_html)
    doc2 = minhash.compute_signature(large_html)
    assert minhash.estimate_similarity(doc1, doc2) == 1.0
    
    # Test with invalid documents
    doc_without_signature = HTMLDocument(content="test")
    valid_doc = minhash.compute_signature("test")
    
    with pytest.raises(ValueError):
        minhash.estimate_similarity(doc_without_signature, valid_doc)

def test_html_invariants(minhash: MinHasher) -> None:
    """Test invariance to HTML formatting and structure changes."""
    html1 = """
    <html><body>
        <div><p>Content 1</p></div>
        <div><p>Content 2</p></div>
    </body></html>
    """
    
    html2 = """
    <html><body>
        <section>
            <div><p>Content 2</p></div>
            <div><p>Content 1</p></div>
        </section>
    </body></html>
    """
    
    doc1 = minhash.compute_signature(html1)
    doc2 = minhash.compute_signature(html2)
    
    similarity = minhash.estimate_similarity(doc1, doc2)
    # Should be similar despite different structure
    assert similarity > 0.6