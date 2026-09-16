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


def _format_val(val, prefix: str = "", is_large_number: bool = False) -> str:
    if val in ("N/A", None):
        return "N/A"
    try:
        num = float(val)
        if is_large_number:
            if num >= 1e12:
                return f"{prefix}{num / 1e12:.2f} трлн"
            if num >= 1e9:
                return f"{prefix}{num / 1e9:.2f} млрд"
            if num >= 1e6:
                return f"{prefix}{num / 1e6:.2f} млн"
        return f"{prefix}{num:.2f}"
    except Exception:
        return str(val)

def _build_stock_info(info: dict) -> list[dict]:
    fv = _format_val
    return [
        {"label": "Відкриття", "value": fv(info.get("regularMarketOpen") or info.get("open"), prefix="$")},
        {"label": "Обсяг", "value": fv(info.get("volume"), is_large_number=True)},
        {"label": "52-тиж. макс.", "value": fv(info.get("fiftyTwoWeekHigh"), prefix="$")},
        {"label": "Бета-фактор", "value": fv(info.get("beta"))},
        {"label": "52-тиж. мін.", "value": fv(info.get("fiftyTwoWeekLow"), prefix="$")},
        {"label": "Р/Е (Ц/П)", "value": fv(info.get("trailingPE"))},
    ]

# -----------------------------------------------------------------------
# GET /api/info/{ticker}
# -----------------------------------------------------------------------

@router.get("/info/{ticker}")
def get_asset_info(
    ticker: str,
    provider: YFinanceProvider = Depends(get_data_provider),
):
    """Повертає метаінформацію про актив для панелі деталей."""
    info = provider.fetch_info(ticker)
    return _build_stock_info(info)

# -----------------------------------------------------------------------
# GET /api/history/{ticker}
# -----------------------------------------------------------------------

@router.get("/history/{ticker}")
def get_historical_data(
    ticker: str,
    lookback: int = 5,
    provider: YFinanceProvider = Depends(get_data_provider),
):
    """Повертає історичні ціни закриття для C# бекенду."""
    period_str = f"{lookback}y"
    df = provider.fetch_history(ticker, period_str)
    
    result = []
    is_mock = getattr(df, "attrs", {}).get("is_mock", False)
    if not df.empty:
        for date, row in df.iterrows():
            result.append({
                "Date": date.isoformat(),
                "Close": float(row["Close"])
            })
    return {
        "is_mock": is_mock,
        "data": result
    }

# -----------------------------------------------------------------------
# GET /api/news/{ticker}
# -----------------------------------------------------------------------

@router.get("/news/{ticker}")
def get_news(
    ticker: str,
    limit: int = 5,
    provider: YFinanceProvider = Depends(get_data_provider),
):
    """Повертає новини для C# бекенду (який потім віддає їх на UI)."""
    return provider.fetch_news(ticker, limit)
