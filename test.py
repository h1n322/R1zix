import urllib.request, json
url = "http://localhost:8000/api/history/AAPL?lookback=5"
data = json.loads(urllib.request.urlopen(url).read())
for d in data:
    if "2026-05-19" in d["Date"]:
        print(d)
