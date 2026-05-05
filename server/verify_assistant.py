
import requests
import json

try:
    response = requests.post(
        "http://localhost:8001/api/query",
        json={"query": "Summarize the key points of the SAMPLE POLICY DOCUMENT.pdf found in the Knowledge Vault."}
    )
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
