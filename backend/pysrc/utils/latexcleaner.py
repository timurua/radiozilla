import re
from typing import Pattern, List, Set, Tuple

class LatexCleaner:
    """A class to detect and remove LaTeX/TeX sequences from strings."""
    
    def __init__(self) -> None:
        # Define patterns for different LaTeX elements
        self.math_patterns: List[Tuple[str, bool]] = [
            (r'\$\$[^$]+?\$\$', True),          # Display math mode
            (r'\$[^$]+?\$', True),              # Inline math mode
            (r'\\begin{equation}.*?\\end{equation}', True),  # Equation environment
            (r'\\begin{align}.*?\\end{align}', True),       # Align environment
        ]
        
        self.command_patterns: List[Tuple[str, bool]] = [
            (r'\\text[a-zA-Z]*{[^}]*}', False),  # Text commands
            (r'\\[a-zA-Z]+{[^}]*}', False),      # General commands
            (r'\\[a-zA-Z]+\[.*?\]{[^}]*}', False), # Commands with optional args
            (r'\\begin{.*?}', False),            # Begin commands
            (r'\\end{.*?}', False),              # End commands
        ]
        
        # Compile all patterns
        self.patterns: List[Tuple[Pattern, bool]] = [
            (re.compile(pattern, re.DOTALL), is_math) 
            for pattern, is_math in self.math_patterns + self.command_patterns
        ]
        
    def clean(self, text: str, substitute: str = '') -> str:
        """
        Remove LaTeX/TeX sequences from the input string.
        
        Args:
            text (str): Input string containing LaTeX/TeX sequences
            substitute (str, optional): Text to replace math expressions with. 
                                      Defaults to empty string.
            
        Returns:
            str: Cleaned string with LaTeX/TeX sequences replaced
        """
        if not text:
            return text
        
        result = text
        
        # Process each pattern in order
        for pattern, is_math in self.patterns:
            result = pattern.sub(substitute if is_math else '', result)
        
        # Clean up remaining braces
        result = self._clean_braces(result)
        
        # Clean up extra whitespace
        result = ' '.join(result.split())
        
        return result
    
    def _clean_braces(self, text: str) -> str:
        """Remove matching pairs of curly braces and their content."""
        stack: List[int] = []
        chars = list(text)
        for i, char in enumerate(chars):
            if char == '{':
                stack.append(i)
            elif char == '}' and stack:
                start = stack.pop()
                # Mark the range to be removed
                for j in range(start, i + 1):
                    chars[j] = ''
        
        return ''.join(chars)