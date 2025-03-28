import requests
import datetime
import time

def extract_datetime(text: str, locale="en_US"):
    try:
        now = int(time.time() * 1000)  # milliseconds
        response = requests.post("http://localhost:8000/parse", data={
            "locale": locale,
            "text": text,
            "reftime": now
        })
        duckling_data = response.json()
        for item in duckling_data:
            if item.get("dim") == "time":
                return item["value"]["value"]
    except Exception as e:
        print("Duckling error:", e)
    return None
