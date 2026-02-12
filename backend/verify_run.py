import requests
import json

def test_run_code():
    url = "http://localhost:8000/api/run"
    
    # Test Python
    payload_py = {
        "code": "print('Hello from Verified Python')",
        "language": "python"
    }
    try:
        response = requests.post(url, json=payload_py)
        print(f"Python Status: {response.status_code}")
        print(f"Python Response: {response.json()}")
    except Exception as e:
        print(f"Python Test Failed: {e}")

    # Test JS
    payload_js = {
        "code": "console.log('Hello from Verified JS');",
        "language": "javascript"
    }
    try:
        response = requests.post(url, json=payload_js)
        print(f"JS Status: {response.status_code}")
        print(f"JS Response: {response.json()}")
    except Exception as e:
        print(f"JS Test Failed: {e}")

if __name__ == "__main__":
    test_run_code()
