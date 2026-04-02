import traceback
from fastapi import APIRouter, HTTPException, Response
import yfinance as yf
from schemas.simulation_schemas import SimulationRequest
from services.simulation_service import get_simulation_data
from utils.pdf_generator import generate_pdf_report

router = APIRouter()

# --- ДОДАЄМО НАШ АВТОКОРЕКТОР ---
def format_ticker(ticker: str) -> str:
    """Очищає тикер і додає -USD для популярних криптовалют."""
    ticker = ticker.upper().strip() # Робимо великими літерами і прибираємо пробіли
    crypto_shortcuts = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "DOT", "LTC", "AVAX"]
    
    if ticker in crypto_shortcuts:
        return f"{ticker}-USD"
    return ticker
# --------------------------------

@router.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    # Пропускаємо тикер через автокоректор перед аналізом
    req.ticker = format_ticker(req.ticker) 
    
    print(f"🚀 ОТРИМАНО ЗАПИТ НА СИМУЛЯЦІЮ ДЛЯ: {req.ticker}") 
    try:
        return get_simulation_data(req)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/report")
def get_report(req: SimulationRequest):
    # Тут теж пропускаємо через автокоректор, щоб PDF генерувався правильно
    req.ticker = format_ticker(req.ticker)
    
    try:
        sim_data = get_simulation_data(req)
        
        metrics = {
            "expected_price": sim_data["expected_price"],
            "var_5": sim_data["var_5"],
            "cvar_5": sim_data["cvar_5"],
            "volatility": sim_data["volatility"]
        }
        
        pdf_content = generate_pdf_report(metrics, sim_data["chart_data"], req.ticker)
        
        if isinstance(pdf_content, str):
            pdf_content = pdf_content.encode('latin1')
        elif isinstance(pdf_content, bytearray):
            pdf_content = bytes(pdf_content)
            
        safe_ticker = req.ticker.replace(",", "_").replace(" ", "")
        filename = f"RiskMate_Report_{safe_ticker}.pdf"
        
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
        
        return Response(content=pdf_content, media_type="application/pdf", headers=headers)
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/api/market-overview")
def get_market_overview():
    tickers = [
    "SPY", "QQQ", "GLD", "BTC-USD", 
    "AAPL", "MSFT", "NVDA", "GOOGL", 
    "TSLA", "META", "AMD", "ETH-USD"
]
    result = []
    try:
        data = yf.download(tickers, period="5d")['Close']
        for t in tickers:
            series = data[t].dropna()
            if len(series) >= 2:
                current_price = float(series.iloc[-1])
                prev_price = float(series.iloc[-2])
                change_pct = ((current_price - prev_price) / prev_price) * 100
                result.append({
                    "ticker": t,
                    "price": f"{current_price:,.2f}",
                    "change": f"{change_pct:+.2f}%",
                    "isUp": change_pct >= 0
                })
        return result
    except Exception:
        return []