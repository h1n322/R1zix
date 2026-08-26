import sys
import os

# Add the riskmate-ai-service to the python path
sys.path.append("/Users/max/Public/Riskmate/Riskmate/riskmate-ai-service")

from infrastructure.data_provider import YFinanceProvider
from unittest.mock import patch

def test_fallback():
    provider = YFinanceProvider(retries=1, retry_delay=0.1)
    
    # 1. Test normal YFinance behavior
    print("Testing YFinance success...")
    df = provider.fetch_history("AAPL", "1y")
    print(f"Data shape: {df.shape}, is_mock: {getattr(df, 'attrs', {}).get('is_mock')}")

    # 2. Test AlphaVantage fallback
    print("\nTesting AlphaVantage fallback...")
    with patch('yfinance.Ticker.history', side_effect=Exception("Yahoo Blocked")):
        df2 = provider.fetch_history("IBM", "1y")
        print(f"Data shape: {df2.shape}, is_mock: {getattr(df2, 'attrs', {}).get('is_mock')}")

    # 3. Test Mock fallback
    print("\nTesting Mock fallback...")
    with patch('yfinance.Ticker.history', side_effect=Exception("Yahoo Blocked")), \
         patch('httpx.Client.get', side_effect=Exception("AlphaVantage Blocked")):
        df3 = provider.fetch_history("TSLA", "1y")
        print(f"Data shape: {df3.shape}, is_mock: {getattr(df3, 'attrs', {}).get('is_mock')}")

if __name__ == "__main__":
    test_fallback()
