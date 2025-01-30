from enum import Enum
from datetime import datetime, timedelta
from typing import NamedTuple

class SummaryLength(Enum):
    short="short"
    medium="medium"
    long="long"

class SummaryTone(Enum):
    formal="formal"
    informal="informal"
    neutral="neutral"

class SummaryFocus(Enum):
    key_points = "key points"
    data = "data"
    examples = "examples"

class SummaryConfig:
    def __init__(self, language: str, length: SummaryLength, tone: SummaryTone, focuses: list[SummaryFocus]) -> None:
        self.language = language
        self.length = length
        self.tone = tone
        self.focuses = focuses


class SummaryPrompt:
    def __init__(self, text: str, config: SummaryConfig) -> None:
        self.text = text
        self.config = config

    def get_prompt(self)-> str:
        prompt = (
                f"Provide a {self.config.tone.value} summary in {self.config.language} "
                f"that focuses on {', '.join([focus.value for focus in self.config.focuses])}. "
                f"The summary should be {self.config.length.value} in length.\n\n"
                f"{self.text}")
        return prompt
    
class DateDeductionPrompt:
    def __init__(self, text: str) -> None:
        self.text = text

    def get_prompt(self)-> str:
        prompt = (
                f"Deduce date from the following text. Answer with just the date in format DD.MM.YYYY: {self.text}")
        return prompt
            

                

