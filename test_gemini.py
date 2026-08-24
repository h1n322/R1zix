import requests
import json
import sys

def test():
    with open('RiskMate.MathEngine/RiskMate.Api/appsettings.json') as f:
        config = json.load(f)
    api_key = config.get("GeminiApiKey", "YOUR_GEMINI_API_KEY_HERE")
    if api_key == "YOUR_GEMINI_API_KEY_HERE":
        print("API key is still the default.")
        return

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": "Hello, this is a test"}
                ]
            }
        ]
    }
    
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(response.text)

if __name__ == "__main__":
    test()
