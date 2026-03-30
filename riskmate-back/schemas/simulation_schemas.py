from pydantic import BaseModel
from typing import Optional

class SimulationRequest(BaseModel):
    ticker: str
    algorithm: str
    simulations: int
    horizon: int
    scenario: Optional[str] = None
    lookback_years: int = 5           # Глибина історії (за замовчуванням 5 років)
    var_confidence: float = 0.95      # Рівень довіри (за замовчуванням 95%)
    risk_free_rate: float = 0.045