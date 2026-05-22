from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
# Імпортуємо нашу нову функцію з мосту
from services.monte_carlo import run_fast_simulation 

router = APIRouter()

# Модель даних, яку очікує FastAPI від React-фронтенду
class SimulationRequest(BaseModel):
    ticker: str
    initial_price: float
    volatility: float
    drift: float
    time_horizon: int = 252
    simulations_count: int = 10000

@router.post("/simulate")
async def run_simulation_endpoint(request: SimulationRequest):
    # Викликаємо функцію, яка звернеться до C#
    result = run_fast_simulation(
        ticker=request.ticker,
        initial_price=request.initial_price,
        volatility=request.volatility,
        drift=request.drift,
        time_horizon=request.time_horizon,
        simulations_count=request.simulations_count
    )
    
    if result["status"] == "error":
        # Якщо C# сервер не відповідає, віддаємо помилку 503 Service Unavailable
        raise HTTPException(status_code=503, detail=result["message"])
        
    return result