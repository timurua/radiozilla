from enum import Enum
from datetime import datetime, timedelta
from pyradiozilla.rss import RssEntry
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


class SummaryPropmpt:
    def __init__(self, text: str, config: SummaryConfig) -> str:
        self.text = text
        self.config = config

    def get_prompt(self)-> str:
        prompt = (
                f"Provide a {self.config.tone.value} summary in {self.config.language} "
                f"that focuses on {', '.join([focus.value for focus in self.config.focuses])}. "
                f"The summary should be {self.config.length.value} in length.\n\n"
                f"{self.text}")
        return prompt
    

class RssPrompt(NamedTuple):
    start_date: datetime
    prompt: str    
    
    
class RssWeeklySummaryPropmpt:
    def __init__(self, entries: list[RssEntry], config: SummaryConfig) -> None:
        self.entries = entries 
        self.config = config

    def get_week_start(self, date_input: datetime) -> datetime:
        days_since_monday = date_input.weekday()
        monday = date_input - timedelta(days=days_since_monday)
        monday_midnight = monday.replace(hour=0, minute=0, second=0, microsecond=0)
        return monday_midnight

    def get_prompts(self)-> list[RssPrompt]:
        weekly_data = {}
        for entry in self.entries:    
            week_start_date = self.get_week_start(entry.published_date)
            if week_start_date not in weekly_data:
                weekly_data[week_start_date] = []
            weekly_data[week_start_date].append(entry)
            
        result = []
        for week_start_date, entries in weekly_data.items():
            week_end_date = week_start_date + timedelta(days=6)
            week_summary = " \n".join([f"{entry.title}: {entry.description}" for entry in entries])
            prompt = f"News from {week_start_date.strftime('%Y-%m-%d')} to {week_end_date.strftime('%Y-%m-%d')}:\n\n{week_summary}"
            
            result.append(
                RssPrompt(
                    start_date=week_start_date,
                    prompt=SummaryPropmpt(prompt, self.config).get_prompt()
                )
            )              
            
        return result
            

                

