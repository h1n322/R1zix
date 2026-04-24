"""
api/routes_market.py — market overview і LSTM прогноз.
"""
from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_data_provider, get_predict_service
from infrastructure.data_provider import YFinanceProvider
from services.predict_service import PredictService

router = APIRouter(prefix="/api", tags=["market"])

_MARKET_TICKERS = [
    "SPY", "QQQ", "GLD", "BTC-USD",
    "AAPL", "MSFT", "NVDA", "GOOGL",
    "TSLA", "META", "AMD", "ETH-USD",
]


# -----------------------------------------------------------------------
# GET /api/market-overview
# -----------------------------------------------------------------------

@router.get("/market-overview")
def get_market_overview(
    provider: YFinanceProvider = Depends(get_data_provider),
):
    """Повертає поточні ціни та добову зміну для 12 топ-активів."""
    return provider.fetch_market_overview(_MARKET_TICKERS)


# -----------------------------------------------------------------------
# GET /api/predict/{ticker}
# -----------------------------------------------------------------------

@router.get("/predict/{ticker}")
def get_prediction(
    ticker: str,
    service: PredictService = Depends(get_predict_service),
):
    """LSTM прогноз ціни на завтра. Модель має бути попередньо натренована."""
    clean_ticker = ticker.upper().strip()
    price = service.predict_tomorrow(clean_ticker)

    if price is None:
        raise HTTPException(
            status_code=404,
            detail=f"Модель для {clean_ticker} не знайдена. Спочатку натренуйте її.",
        )

    return {
        "ticker": clean_ticker,
        "predicted_price_tomorrow": round(price, 2),
        "message": "Прогноз згенеровано успішно за допомогою LSTM",
    }