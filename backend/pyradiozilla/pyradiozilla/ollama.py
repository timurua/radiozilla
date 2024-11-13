import requests
import json

class OllamaClient:
    def __init__(self, model: str, host="localhost", port=11434):
        self.base_url = f"http://{host}:{port}/api"
        self.headers = {
            "Content-Type": "application/json"
        }
        self.model = model

    def generate(self, prompt):
        url = f"{self.base_url}/generate"
        data = {
            "model": self.model,
            "prompt": prompt,
            "keep_alive": 0
        }

        try:
            response = requests.post(url, json=data, headers=self.headers, stream=True)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error connecting to Ollama API: {e}")
            return None

        output = ''
        for line in response.iter_lines():
            if line:
                try:
                    line_json = json.loads(line.decode('utf-8'))
                    output += line_json.get('response', '')
                except json.JSONDecodeError:
                    continue

        return output.strip()
    
    def unload_all_models(self):
        # Step 1: Retrieve the list of loaded models
        try:
            response = requests.get(f"{self.base_url}/ps")
            response.raise_for_status()
            loaded_models = response.json()
        except requests.RequestException as e:
            print("Error retrieving model list:", e)
            return
        
        # Step 2: Check and unload each model if loaded
        for model in loaded_models.get("models", []):
            model_name = model.get("name")
            if model_name:
                try:
                    # Unload each model by setting `keep_alive` to 0
                    unload_payload = {"model": model_name, "keep_alive": 0}
                    unload_response = requests.post(f"{self.base_url}/generate", json=unload_payload)
                    unload_response.raise_for_status()
                    print(f"Unloaded model: {model_name}")
                except requests.RequestException as e:
                    print(f"Error unloading model {model_name}:", e)