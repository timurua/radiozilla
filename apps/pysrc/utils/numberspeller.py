from typing import Dict, List
import re

class NumberToWords:
    def __init__(self) -> None:
        self.ones: Dict[int, str] = {
            0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
            5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine'
        }
        self.teens: Dict[int, str] = {
            10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen',
            14: 'fourteen', 15: 'fifteen', 16: 'sixteen',
            17: 'seventeen', 18: 'eighteen', 19: 'nineteen'
        }
        self.tens: Dict[int, str] = {
            2: 'twenty', 3: 'thirty', 4: 'forty', 5: 'fifty',
            6: 'sixty', 7: 'seventy', 8: 'eighty', 9: 'ninety'
        }
        self.scales: List[str] = ['', 'thousand', 'million', 'billion']

    def convert(self, number: int) -> str:       
        if not isinstance(number, int):
            raise TypeError("Input must be an integer")
            
        if number < -999999999999 or number > 999999999999:
            raise ValueError(f"Number out of supported range {number}")
        
        if len(str(number)) > 12:
            raise ValueError(f"Too long: {number}")
        
        if number == 0:
            return self.ones[0]

        if number < 0:
            return f"minus {self._convert_positive(abs(number))}"

        return self._convert_positive(number)

    def _convert_positive(self, number: int) -> str:
        if number == 0:
            return ""

        parts: List[str] = []
        scale_index = 0

        while number > 0:
            current_chunk = number % 1000
            if current_chunk != 0:
                chunk_str = self._convert_chunk(number, current_chunk)
                if scale_index > 0:
                    chunk_str += f" {self.scales[scale_index]}"
                parts.append(chunk_str)
            
            number //= 1000
            scale_index += 1

        return " ".join(reversed(parts))

    def _convert_chunk(self, total: int, number: int) -> str:
        if number == 0:
            return ""

        parts: List[str] = []

        # Handle hundreds
        hundreds = number // 100
        if hundreds > 0:
            parts.append(f"{self.ones[hundreds]} hundred")

        # Handle remaining two digits
        remaining = number % 100
        if remaining > 0:
            if parts or total > number:  # If we already have hundreds, add "and"
                parts.append("and")
            
            if remaining < 10:
                parts.append(self.ones[remaining])
            elif remaining < 20:
                parts.append(self.teens[remaining])
            else:
                tens_digit = remaining // 10
                ones_digit = remaining % 10
                if ones_digit == 0:
                    parts.append(self.tens[tens_digit])
                else:
                    parts.append(f"{self.tens[tens_digit]} {self.ones[ones_digit]}")

        return " ".join(parts)
    
class NumberMatcher:
    def __init__(self):
        # Match positive/negative numbers, integers/decimals, with or without leading zeros
        self.number_pattern = re.compile(r'-?\d*\.?\d+')
    
    def find_numbers(self, text: str) -> List[str]:
        matches = self.number_pattern.findall(text)
        return matches    
    
    def find_numbers_with_positions(self, text: str) -> List[tuple[str, int, int]]:
        matches = self.number_pattern.finditer(text)
        return [(match.group(), match.start(), match.end()) for match in matches]

class NumbersToTextPreprocessor:
    def __init__(self) -> None:
        self.number_to_words = NumberToWords()
        self.number_matcher = NumberMatcher()
    
    def preprocess(self, text: str) -> str:
        try:
            numbers = self.number_matcher.find_numbers_with_positions(text) 
            
            substitutes = []
            for (original_number, start, end) in numbers:
                number = original_number
                try:
                    words = []
                    if number.startswith('-'):
                        words.append('minus')
                        number = number[1:]
                    if '.' in number:
                        integer_part, decimal_part = number.split('.')
                        if integer_part:
                            words.append(self.number_to_words.convert(int(integer_part)))
                        words.append('point')
                        words.append(' '.join(self.number_to_words.convert(int(d)) for d in decimal_part))
                    else:
                        words.append(self.number_to_words.convert(int(number)))
                    spelled_number = ' '.join(words)
                except ValueError:
                    # If conversion fails, keep the original number
                    spelled_number = " "
                substitutes.append((original_number, spelled_number, start, end))

            for original, substitute, start, end in reversed(substitutes):
                text = text[:start] + substitute + text[end:]
                
            return text
        except Exception as e:
            print(f"Error in NumbersToTextPreprocessor: {e} for text: {text}")
            raise e
             
