import json
from typing import List, Dict, Optional
from crewai import Agent, Task, Crew, LLM # type: ignore[import-untyped] 
from git import exc
from langchain_community.llms.ollama import Ollama
import logging

class CrewAISummarizer:
    def __init__(self, ollama_model: str)  -> None:
        # Initialize Qwen model through Ollama        
        self.llm = LLM(model=f"ollama/{ollama_model}", base_url="http://localhost:11434", )
        self.logger = logging.getLogger("crewai_summarizer")
        
    def create_agents(self) -> List[Agent]:
        """Create the agents needed for the summarization task."""
        summarizer_agent = Agent(
            role='News Summarizer',
            goal='Create concise and accurate news summaries between 200-300 words',
            backstory="""You are an expert news editor skilled at creating precise 
            summaries while maintaining the essential information and context.""",
            llm=self.llm,
            verbose=True
        )
        
        validator_agent = Agent(
            role='Summary Validator',
            goal='Ensure summaries meet the word count requirements and maintain quality',
            backstory="""You are a detail-oriented editor who ensures all content 
            meets specific requirements while maintaining high quality.""",
            llm=self.llm,
            verbose=True
        )
        
        return [summarizer_agent, validator_agent]
    
    def create_tasks(self, agents: List[Agent], article: str) -> List[Task]:
        """Create the tasks for summarizing and validating the article."""
        summarize_task = Task(
            description=f"""Summarize the following article in 200-300 words. 
            Maintain key information and context while being concise:
            {article}""",
            agent=agents[0], 
            expected_output="Summary of the article",           
        )
        
        validate_task = Task(
            description="""Review the summary and verify it meets the following criteria:
            1. Word count between 200-300 words
            2. Maintains key information from the original article
            3. Clear and coherent writing
            
            If criteria are not met, revise the summary accordingly.""",
            agent=agents[1],
            expected_output="Summary meets the criteria",
        )
        
        return [summarize_task, validate_task]
    
    def generate_summary(self, article: str) -> str:
        """Generate a summary of the given article."""
        agents = self.create_agents()
        tasks = self.create_tasks(agents, article)
        
        crew = Crew(
            agents=agents,
            tasks=tasks,
            verbose=True
        )
        
        summary = ""
        
        for attempt in range(3):
            try:
                crew_output = crew.kickoff()                        
                summary = crew_output.raw
                word_num = len(summary.split())
                if word_num <= 300:
                    break
            except Exception as e:
                self.logger.error(f"Error occurred during summarization: {e}")
        
        if summary.startswith("Final Summary ("):
            summary = summary[15:]
            
        if summary.endswith(")"):
            summary = summary[:-1]
            
        return summary
            
        
            

# Example usage
if __name__ == "__main__":
    # Sample article text
    article = """The Future of Sustainable Urban Transportation

As cities worldwide grapple with increasing population density and environmental concerns, the transformation of urban transportation systems has become a critical focus for policymakers, urban planners, and environmentalists alike. The traditional model of car-centric city design is giving way to more sustainable, efficient, and human-centered approaches that promise to revolutionize how we move through urban spaces.

At the forefront of this transformation is the concept of the "15-minute city," where all essential services and amenities are accessible within a quarter-hour walk or bike ride from any residence. This urban planning philosophy, pioneered in Paris and rapidly gaining traction globally, represents a fundamental shift in how we conceptualize urban mobility and community design.

The integration of smart technology plays a pivotal role in this evolution. Cities are increasingly deploying sophisticated traffic management systems that use artificial intelligence to optimize traffic flow, reduce congestion, and minimize emissions. Real-time data analytics help commuters make informed decisions about their travel routes and transportation modes, while smart parking solutions reduce the time and fuel wasted in searching for parking spaces.

Public transportation systems are undergoing their own revolution. Electric buses, powered by renewable energy sources, are replacing diesel fleets in major cities. Advanced routing algorithms ensure more efficient service delivery, while mobile apps provide passengers with real-time updates and seamless payment options. Some cities are experimenting with autonomous shuttles for last-mile connectivity, bridging the gap between major transit hubs and residential areas.

Micromobility solutions have emerged as a crucial component of the urban transportation ecosystem. Electric scooters, shared bicycles, and other personal mobility devices offer flexible, emission-free alternatives for short trips. These services, when properly regulated and integrated with existing public transit systems, can significantly reduce car dependency and improve air quality.

The rise of remote work, accelerated by recent global events, has also influenced urban mobility patterns. Many cities are adapting their transportation infrastructure to accommodate more flexible commuting schedules and changing travel patterns. This includes the development of neighborhood work hubs and the conversion of some vehicle lanes into dedicated cycling and pedestrian spaces.

Infrastructure innovations are equally important in this transformation. Cities are investing in green corridors, elevated cycle highways, and car-free zones that prioritize pedestrians and cyclists. Underground spaces are being reimagined to create weather-protected walkways and cycling routes, while former parking lots are being converted into community spaces and urban gardens.

The economic implications of these changes are significant. Studies suggest that investments in sustainable urban transportation infrastructure can generate substantial returns through reduced healthcare costs, increased productivity, and enhanced property values. Local businesses often see increased foot traffic and sales when streets are made more pedestrian-friendly and accessible by various transportation modes.

However, the transition to sustainable urban transportation faces several challenges. Social equity concerns must be addressed to ensure that new mobility solutions are accessible and affordable for all residents. The needs of elderly and disabled individuals require particular attention in system design and implementation. Additionally, the integration of new transportation modes with existing infrastructure requires careful planning and significant investment.

Climate resilience is another crucial consideration. Transportation infrastructure must be designed to withstand increasingly frequent extreme weather events while maintaining service reliability. This includes developing redundant systems, implementing flood protection measures, and ensuring backup power sources for critical transportation infrastructure.

Looking ahead, the future of urban transportation will likely be characterized by increased connectivity, automation, and sustainability. The development of transportation hubs that seamlessly integrate various mobility options, from high-speed rail to electric bikes, will become standard in urban design. Advanced materials and construction techniques will enable the creation of more durable and environmentally friendly infrastructure.

The success of sustainable urban transportation initiatives ultimately depends on public engagement and behavior change. Cities must work closely with communities to understand their mobility needs and preferences while promoting the benefits of sustainable transportation options. Education and incentive programs can help overcome initial resistance to change and encourage the adoption of new mobility solutions.

As we move forward, the transformation of urban transportation systems represents not just a technological challenge but a fundamental reimagining of how we live and move in urban spaces. The cities that successfully navigate this transition will not only reduce their environmental impact but also create more livable, equitable, and prosperous communities for future generations."""
    
    summarizer = CrewAISummarizer("deepseek-r1:8b")
    result = summarizer.generate_summary(article + article)
    
    print(f"\nFinal Summary ({result})")
