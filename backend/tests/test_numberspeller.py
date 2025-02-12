from pysrc.utils.numberspeller import NumberToWords, NumberMatcher, NumbersToTextPreprocessor
import pytest

def test_single_digits():
    converter = NumberToWords()
    assert converter.convert(0) == "zero"
    assert converter.convert(1) == "one"
    assert converter.convert(5) == "five"
    assert converter.convert(9) == "nine"

def test_teens():
    converter = NumberToWords()
    assert converter.convert(10) == "ten"
    assert converter.convert(11) == "eleven"
    assert converter.convert(15) == "fifteen"
    assert converter.convert(19) == "nineteen"

def test_tens():
    converter = NumberToWords()
    assert converter.convert(20) == "twenty"
    assert converter.convert(30) == "thirty"
    assert converter.convert(42) == "forty two"
    assert converter.convert(99) == "ninety nine"

def test_hundreds():
    converter = NumberToWords()
    assert converter.convert(100) == "one hundred"
    assert converter.convert(101) == "one hundred and one"
    assert converter.convert(110) == "one hundred and ten"
    assert converter.convert(999) == "nine hundred and ninety nine"

def test_thousands():
    converter = NumberToWords()
    assert converter.convert(1000) == "one thousand"
    assert converter.convert(1001) == "one thousand and one"
    assert converter.convert(1100) == "one thousand one hundred"
    assert converter.convert(2345) == "two thousand three hundred and forty five"

def test_millions():
    converter = NumberToWords()
    assert converter.convert(1000000) == "one million"
    assert converter.convert(1000001) == "one million and one"
    assert converter.convert(1234567) == "one million two hundred and thirty four thousand five hundred and sixty seven"

def test_billions():
    converter = NumberToWords()
    assert converter.convert(1000000000) == "one billion"
    assert converter.convert(1234567890) == "one billion two hundred and thirty four million five hundred and sixty seven thousand eight hundred and ninety"

def test_negative_numbers():
    converter = NumberToWords()
    assert converter.convert(-1) == "minus one"
    assert converter.convert(-100) == "minus one hundred"
    assert converter.convert(-1234) == "minus one thousand two hundred and thirty four"

def test_invalid_input():
    converter = NumberToWords()
    with pytest.raises(TypeError):
        converter.convert(3.14)
    with pytest.raises(TypeError):
        converter.convert("123")
    with pytest.raises(ValueError):
        converter.convert(1000000000000)
    with pytest.raises(ValueError):
        converter.convert(-1000000000000)

def test_find_numbers_basic():
    matcher = NumberMatcher()
    assert matcher.find_numbers("123") == ["123"]
    assert matcher.find_numbers("test") == []
    assert matcher.find_numbers("The number is 42") == ["42"]
    assert matcher.find_numbers("-123.456") == ["-123.456"]

def test_find_numbers_multiple():
    matcher = NumberMatcher()
    assert matcher.find_numbers("1 2 3") == ["1", "2", "3"]
    assert matcher.find_numbers("First number: 123, second: 456.789") == ["123", "456.789"]
    assert matcher.find_numbers("Price: -42.99, Count: 5") == ["-42.99", "5"]
    
def test_find_numbers_edge_cases():
    matcher = NumberMatcher()
    assert matcher.find_numbers("") == []
    assert matcher.find_numbers("no numbers here") == []
    assert matcher.find_numbers("12.34.56") == ["12.34", ".56"]
    assert matcher.find_numbers(".123 -.456") == [".123", "-.456"]

def test_basic_numbers():
    matcher = NumberMatcher()
    assert matcher.find_numbers("123 456") == ["123", "456"]
    assert matcher.find_numbers("0 1 2 3") == ["0", "1", "2", "3"]

def test_decimal_numbers():
    matcher = NumberMatcher()
    assert matcher.find_numbers(".123 .456") == [".123", ".456"]
    assert matcher.find_numbers("0.123 0.456") == ["0.123", "0.456"]

def test_negative_numbers():
    matcher = NumberMatcher()
    assert matcher.find_numbers("-123 -456") == ["-123", "-456"]
    assert matcher.find_numbers("-.123 -.456") == ["-.123", "-.456"]
    assert matcher.find_numbers("-0.123 -0.456") == ["-0.123", "-0.456"]

def test_mixed_numbers():
    matcher = NumberMatcher()
    assert matcher.find_numbers("123 -456 .789 -.012") == ["123", "-456", ".789", "-.012"]
    assert matcher.find_numbers("-1.23 0.45 -.67 .89") == ["-1.23", "0.45", "-.67", ".89"]

def test_numbers_with_text():
    matcher = NumberMatcher()
    assert matcher.find_numbers("abc123def -456.789 ghi") == ["123", "-456.789"]
    assert matcher.find_numbers("price: -123.45 quantity: 67") == ["-123.45", "67"]

def test_empty_and_no_numbers():
    matcher = NumberMatcher()
    assert matcher.find_numbers("") == []
    assert matcher.find_numbers("abc def ghi") == []

def test_multiple_decimals():
    matcher = NumberMatcher()
    # Note: Numbers with multiple decimal points are matched up to the first decimal
    assert matcher.find_numbers("1.2.3 4.5.6") == ['1.2', '.3', '4.5', '.6']    

def test_number_text_processor():
    matcher = NumbersToTextPreprocessor()
    assert matcher.preprocess("Price: -42.99, Count: 5, Quantity: .5, Magnitude: -.49, Number: -5, Impact: .32") \
        == 'Price: minus forty two point nine nine, Count: five, Quantity: point five, Magnitude: minus point four nine, Number: minus five, Impact: point three two'