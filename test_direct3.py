import httpx
url = "https://query1.finance.yahoo.com/v8/finance/chart/AAPL?range=2d&interval=1d"
resp = httpx.get(url, headers={"User-Agent": "Mozilla/5.0"})
data = resp.json()["chart"]["result"][0]["meta"]
print(list(data.keys()))
print(data.get("chartPreviousClose"))
