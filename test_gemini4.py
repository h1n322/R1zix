import requests
import json

with open('RiskMate.MathEngine/RiskMate.Api/appsettings.json') as f:
    config = json.load(f)
api_key = config.get("GeminiApiKey", "")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
response = requests.post(url, json=payload)
print(response.status_code, response.text)
