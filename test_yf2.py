import yfinance as yf
try:
    df = yf.Ticker("IBM").history(period="1mo")
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
