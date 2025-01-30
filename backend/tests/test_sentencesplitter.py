import pytest
from pysrc.utils.sentencesplitter import SentenceSplitter

@pytest.fixture
def splitter():
    return SentenceSplitter()

def test_basic_sentence_splitting(splitter):
    text = "This is the first sentence. This is the second sentence! Is this the third sentence?"
    expected = [
        "This is the first sentence.",
        "This is the second sentence!",
        "Is this the third sentence?"
    ]
    assert splitter.split_sentences(text) == expected

def test_complex_sentence_splitting(splitter):
    text = "Mr. Smith went to Washington D.C. yesterday. He met with Dr. Brown, Ph.D., at 3:30 P.M. They discussed climate change!"
    expected = [
        "Mr. Smith went to Washington D.C. yesterday.",
        "He met with Dr. Brown, Ph.D., at 3:30 P.M.",
        "They discussed climate change!"
    ]
    assert splitter.split_sentences(text) == expected

def test_single_sentence(splitter):
    text = "This is a single sentence."
    expected = ["This is a single sentence."]
    assert splitter.split_sentences(text) == expected

def test_empty_string(splitter):
    assert splitter.split_sentences("") == []

def test_whitespace_only(splitter):
    assert splitter.split_sentences("   \n  \t  ") == []

def test_multiline_text(splitter):
    text = """This is a paragraph
    with multiple lines. And multiple sentences!
    The lines are separated by newlines."""
    
    expected = [
        """This is a paragraph
    with multiple lines.""",
        "And multiple sentences!",
        "The lines are separated by newlines."
    ]
    result = splitter.split_sentences(text)
    assert result == expected

def test_special_characters(splitter):
    text = "What about émojis 🌟? They should work fine... Right?!"
    expected = [
        "What about émojis 🌟?",
        "They should work fine...",
        "Right?", "!"
    ]
    assert splitter.split_sentences(text) == expected