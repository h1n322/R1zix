"""
api/routes_market.py — market overview і LSTM прогноз.
"""
from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_data_provider, get_predict_service
from infrastructure.data_provider import YFinanceProvider
from services.predict_service import PredictService

router = APIRouter(prefix="/api", tags=["market"])

_MARKET_TICKERS = [
    "SPY", "QQQ", "BTC-USD",
    "AAPL",
]


# -----------------------------------------------------------------------
# GET /api/market-overview
# -----------------------------------------------------------------------

@router.get("/market-overview")
def get_market_overview(
    provider: YFinanceProvider = Depends(get_data_provider),
):
    """Повертає поточні ціни та добову зміну для топ-активів."""
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


# -----------------------------------------------------------------------
# GET /api/info/{ticker}
# -----------------------------------------------------------------------

@router.get("/info/{ticker}")
def get_asset_info(
    ticker: str,
    provider: YFinanceProvider = Depends(get_data_provider),
):
    """Повертає метаінформацію про актив для панелі деталей."""
    from services.simulation_service import SimulationService
    info = provider.fetch_info(ticker)
    
    # Використовуємо той самий форматер, що і в SimulationService
    sim_service = SimulationService(provider)
    return sim_service._build_stock_info(info)
