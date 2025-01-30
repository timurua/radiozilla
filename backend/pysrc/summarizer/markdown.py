import re
from typing import Optional, List, Pattern, Dict, Tuple

class MarkdownStripper:
    def __init__(self) -> None:
        self.patterns: Dict[str, Tuple[Pattern[str], str]] = {
            'headers': (re.compile(r'^#{1,6}\s+(.+)$', re.MULTILINE), r'\1'),
            'bold_asterisks': (re.compile(r'\*\*(.+?)\*\*'), r'\1'),
            'bold_underscores': (re.compile(r'__(.+?)__'), r'\1'),
            'italic_asterisk': (re.compile(r'\*([^*\n]+)\*'), r'\1'),
            'italic_underscore': (re.compile(r'_([^_\n]+)_'), r'\1'),
            'code_blocks': (re.compile(r'```[\s\S]*?```'), ''),
            'inline_code': (re.compile(r'`([^`]+)`'), r'\1'),
            'links': (re.compile(r'\[([^\]]+)\]\([^)]+\)'), r'\1'),
            'images': (re.compile(r'!\[([^\]]*)\]\([^)]+\)'), r'\1'),
            'unordered_list': (re.compile(r'^\s*[-*+]\s+(.+)$', re.MULTILINE), r'\1'),
            'ordered_list': (re.compile(r'^\s*\d+\.\s+(.+)$', re.MULTILINE), r'\1'),
            'blockquotes': (re.compile(r'^\s*>\s*(.+)$', re.MULTILINE), r'\1'),
            'horizontal_rules': (re.compile(r'^\s*([*-_])\s*(?:\1\s*){2,}$', re.MULTILINE), ''),
            'strikethrough': (re.compile(r'~~(.+?)~~'), r'\1')
        }
        
    def strip_element(self, text: str, pattern: Pattern[str], replacement: str) -> str:
        return pattern.sub(replacement, text)
    
    def strip_code_blocks(self, text: str) -> str:
        pattern, replacement = self.patterns['code_blocks']
        result = self.strip_element(text, pattern, replacement)
        return result
    
    def strip_all(self, text: str) -> str:
        # First handle code blocks (complete removal)
        result = self.strip_code_blocks(text)
        
        # Then handle all other patterns
        for pattern, replacement in self.patterns.values():
            result = self.strip_element(result, pattern, replacement)
        
        # Clean up whitespace while preserving line breaks
        # Split into lines
        lines = result.split('\n')
        # Strip each line and filter empty lines
        lines = [line.strip() for line in lines]
        # Remove any empty lines at the start or end
        while lines and not lines[0]:
            lines.pop(0)
        while lines and not lines[-1]:
            lines.pop()
            
        # Join lines back together with correct line breaks
        result = ''
        prev_empty = False
        for i, line in enumerate(lines):
            if not line:
                if not prev_empty:
                    result += '\n\n'
                    prev_empty = True
            else:
                if i > 0 and not prev_empty:
                    result += '\n'
                result += line
                prev_empty = False
                
        return result
    
    def get_stripped_elements(self, text: str) -> Dict[str, List[str]]:
        stripped_elements: Dict[str, List[str]] = {}
        
        for element_type, (pattern, _) in self.patterns.items():
            matches = pattern.findall(text)
            if matches:
                if isinstance(matches[0], tuple):
                    matches = [m[0] for m in matches]
                stripped_elements[element_type] = [m for m in matches if m.strip()]
                
        return stripped_elements