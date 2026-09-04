import sys
import os
sys.path.append('riskmate-ai-service')
from infrastructure.data_provider import YFinanceProvider
provider = YFinanceProvider()
try:
    df = provider.fetch_history('AAPL', '5y')
    print("Success:")
    print(df.head())
except Exception as e:
    import traceback
    traceback.print_exc()
