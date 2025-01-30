from pysrc.summarizer.markdown import MarkdownStripper
import pytest

@pytest.fixture
def stripper():
    return MarkdownStripper()

def test_headers_stripping(stripper):
    input_text = """# Header 1
## Header 2
### Header 3
#### Header 4
##### Header 5
###### Header 6"""
    expected = """Header 1
Header 2
Header 3
Header 4
Header 5
Header 6"""
    assert stripper.strip_all(input_text) == expected

def test_emphasis_stripping(stripper):
    input_text = """**Bold text with asterisks**
__Bold text with underscores__
*Italic text with asterisk*
_Italic text with underscore_"""
    expected = """Bold text with asterisks
Bold text with underscores
Italic text with asterisk
Italic text with underscore"""
    assert stripper.strip_all(input_text) == expected

def test_code_blocks_stripping(stripper):
    input_text = """Here's some code:
```python
def hello():
    print("Hello, world!")
```
And `inline code` here."""
    expected = """Here's some code:

And inline code here."""
    assert stripper.strip_all(input_text) == expected

def test_lists_stripping(stripper):
    input_text = """* Unordered item 1
* Unordered item 2
+ Plus item
- Minus item
1. Ordered item 1
2. Ordered item 2"""
    expected = """Unordered item 1
Unordered item 2
Plus item
Minus item
Ordered item 1
Ordered item 2"""
    assert stripper.strip_all(input_text) == expected

def test_links_and_images_stripping(stripper):
    input_text = """[Link text](https://example.com)
![Image alt text](image.jpg)"""
    expected = """Link text
!Image alt text"""
    assert stripper.strip_all(input_text) == expected

def test_blockquotes_stripping(stripper):
    input_text = """> Single line quote
> Multi-line
> blockquote"""
    expected = """Single line quote
Multi-line
blockquote"""
    assert stripper.strip_all(input_text) == expected

def test_horizontal_rules_stripping(stripper):
    input_text = """Before rule
---
After rule
***
Another after
___
Final text"""
    expected = """Before rule

After rule

Another after

Final text"""
    assert stripper.strip_all(input_text) == expected

def test_strikethrough_stripping(stripper):
    input_text = "This is ~~struck through~~ text"
    expected = "This is struck through text"
    assert stripper.strip_all(input_text) == expected

def test_mixed_formatting(stripper):
    input_text = """# Main Header

This is a **bold** and *italic* text with `inline code`.

> Here's a quote with a [link](https://example.com)

* List item with ~~strikethrough~~
* List item with `code`

```
Code block
with multiple
lines
```"""
    expected = """Main Header

This is a bold and italic text with inline code.
Here's a quote with a link
List item with strikethrough
List item with code"""
    assert stripper.strip_all(input_text) == expected

def test_line_breaks(stripper):
    input_text = """Line 1

Line 2
Line 3


Line 4"""
    expected = """Line 1

Line 2
Line 3

Line 4"""
    assert stripper.strip_all(input_text) == expected

def test_empty_input(stripper):
    assert stripper.strip_all("") == ""
    assert stripper.strip_all("   ") == ""
    assert stripper.strip_all("\n\n\n") == ""

def test_no_markdown(stripper):
    plain_text = "Just some plain text\nwith multiple lines"
    assert stripper.strip_all(plain_text) == plain_text

def test_nested_formatting(stripper):
    input_text = "**Bold with *italic* inside** and *italic with **bold** inside*"
    expected = "Bold with italic inside and italic with bold inside"
    assert stripper.strip_all(input_text) == expected

def test_strip_all(stripper):
    test_text = """Some text
```python
print('hello')
```
**bold text**
*italic text*
[link](http://example.com)
![image](http://example.com/image.png)
- List item"""
    expected = """Some text

bold text
italic text
link
!image
List item"""
    result = stripper.strip_all(test_text)
    assert result == expected