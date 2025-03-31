import aiohttp
import logging
import json

class OllamaClientException(Exception):
    """Exception raised for Ollama client errors."""
    pass

class OllamaClient:
    def __init__(self, model: str, base_url="http://localhost:11434"):
        self.base_url = f"{base_url}/api"
        self.headers = {
            "Content-Type": "application/json"
        }
        self.model = model
        self.logger = logging.getLogger("ollama_client")

    async def generate(self, prompt) -> str:
        url = f"{self.base_url}/generate"
        data = {
            "model": self.model,
            "prompt": prompt,
            "keep_alive": 0
        }

        retries = 3
        timeout = aiohttp.ClientTimeout(connect=60.0)
        
        for attempt in range(retries):
            async with aiohttp.ClientSession(timeout=timeout) as session:
                try:
                    async with session.post(url, json=data, headers=self.headers) as response:
                        response.raise_for_status()
                        text_content = await response.text()
                        lines = text_content.split('\n')
                        output = ""
                        for line in lines:
                            if line.strip():
                                line_json = json.loads(line)
                                output += line_json.get('response', '')
                        return output.strip()
                except aiohttp.ClientError as e:
                    self.logger.error(f"Error connecting to Ollama API: {e}")

        self.logger.error(f"Failed to generate text after {retries} attempts")
        raise OllamaClientException("Failed to generate text after {retries} attempts")

    async def unload_all_models(self):
        # Step 1: Retrieve the list of loaded models
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"{self.base_url}/ps") as response:
                    response.raise_for_status()
                    loaded_models = await response.json()
            except aiohttp.ClientError as e:
                print("Error retrieving model list:", e)
                return

            # Step 2: Check and unload each model if loaded
            for model in loaded_models.get("models", []):
                model_name = model.get("name")
                if model_name:
                    try:
                        # Unload each model by setting `keep_alive` to 0
                        unload_payload = {"model": model_name, "keep_alive": 0}
                        async with session.post(f"{self.base_url}/generate", json=unload_payload) as unload_response:
                            unload_response.raise_for_status()
                            print(f"Unloaded model: {model_name}")
                    except aiohttp.ClientError as e:
                        print(f"Error unloading model {model_name}:", e)

# Example usage
# asyncio.run(OllamaClient().generate("Your prompt here"))
# asyncio.run(OllamaClient().unload_all_models())