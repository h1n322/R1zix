import yfinance as yf
print("Fetching AAPL...")
try:
    df = yf.Ticker("AAPL").history(period="1y")
    print(df.head())
    if df.empty:
        print("Data is empty!")
except Exception as e:
    print(f"Error: {e}")
