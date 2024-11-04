from enum import Enum

class SummaryLength(Enum):
    short=1
    medium=2
    long=3 

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

class Summary:
    def __init__(self, summary) -> None:
        self.