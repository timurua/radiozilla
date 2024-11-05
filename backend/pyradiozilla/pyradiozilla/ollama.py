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
            "prompt": prompt
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