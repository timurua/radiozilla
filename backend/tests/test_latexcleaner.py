import pytest
from pysrc.utils.latexcleaner import LatexCleaner
import re

def test_init():
    cleaner = LatexCleaner()
    assert len(cleaner.patterns) > 0
    for pattern, is_math in cleaner.patterns:
        assert isinstance(pattern, type(re.compile('')))
        assert isinstance(is_math, bool)

def test_empty_input():
    cleaner = LatexCleaner()
    assert cleaner.clean('') == ''
    assert cleaner.clean(None) == None

def test_plain_text():
    cleaner = LatexCleaner()
    text = "Hello, world!"
    assert cleaner.clean(text) == text

def test_simple_math():
    cleaner = LatexCleaner()
    text = "The equation $x + y = z$ represents addition"
    expected = "The equation represents addition"
    assert cleaner.clean(text) == expected
    
    # Test with substitute
    expected_with_sub = "The equation [MATH] represents addition"
    assert cleaner.clean(text, substitute="[MATH]") == expected_with_sub

def test_complex_math():
    cleaner = LatexCleaner()
    text = r"Let's solve $$\int_0^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$"
    expected = r"Let's solve"
    assert cleaner.clean(text) == expected
    
    # Test with substitute
    expected_with_sub = r"Let's solve [EQUATION]"
    assert cleaner.clean(text, substitute="[EQUATION]") == expected_with_sub

def test_equation_environment():
    cleaner = LatexCleaner()
    text = r"Here's an equation: \begin{equation}x^2 + y^2 = r^2\end{equation} in polar form"
    expected = "Here's an equation: in polar form"
    assert cleaner.clean(text) == expected
    
    expected_with_sub = "Here's an equation: [MATH] in polar form"
    assert cleaner.clean(text, substitute="[MATH]") == expected_with_sub

def test_text_command():
    cleaner = LatexCleaner()
    text = r"The \textbf{bold} and \textit{italic} text"
    expected = "The and text"
    assert cleaner.clean(text) == expected

def test_nested_commands():
    cleaner = LatexCleaner()
    text = r"\begin{document}\begin{equation}\text{nested}\end{equation}\end{document}"
    expected = ""
    assert cleaner.clean(text) == expected

def test_multiple_equations():
    cleaner = LatexCleaner()
    text = "We have $x=1$ and $y=2$ giving us $$z=3$$"
    expected = "We have and giving us"
    assert cleaner.clean(text) == expected
    
    expected_with_sub = "We have [EQ] and [EQ] giving us [EQ]"
    assert cleaner.clean(text, substitute="[EQ]") == expected_with_sub

def test_inline_math_with_commands():
    cleaner = LatexCleaner()
    text = r"The formula $\frac{1}{2}\sum_{i=1}^n x_i$ is complex"
    expected = "The formula is complex"
    assert cleaner.clean(text) == expected
    
    expected_with_sub = "The formula [MATH] is complex"
    assert cleaner.clean(text, substitute="[MATH]") == expected_with_sub

def test_mixed_content():
    cleaner = LatexCleaner()
    text = r"Regular text with $math$ and \textbf{formatting} mixed in $$display math$$"
    expected = "Regular text with and mixed in"
    assert cleaner.clean(text) == expected
    
    expected_with_sub = "Regular text with [MATH] and mixed in [MATH]"
    assert cleaner.clean(text, substitute="[MATH]") == expected_with_sub