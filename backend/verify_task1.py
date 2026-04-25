import urllib.request
import json
try:
    url = "http://localhost:9000/api/summary?period=2025-08"
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
    print(f"Total Transactions in DB: {data.get('transaction_count')}")
    
    url_movs = "http://localhost:9000/api/movements?period=2025-08"
    with urllib.request.urlopen(url_movs) as response:
        data_movs = json.loads(response.read().decode())
    print(f"Movements returned by API: {len(data_movs)}")
except Exception as e:
    print(f"Error: {e}")
