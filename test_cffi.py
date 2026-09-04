from curl_cffi import requests
session = requests.Session(impersonate="chrome")
resp = session.get("https://query2.finance.yahoo.com/v8/finance/chart/AAPL?range=1d&interval=1d")
print(resp.status_code)
