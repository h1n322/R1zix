import httpx
url = "https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=5d&interval=1d"
resp = httpx.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"})
print(resp.status_code)
if resp.status_code == 200:
    data = resp.json()["chart"]["result"][0]
    print(len(data["timestamp"]))
