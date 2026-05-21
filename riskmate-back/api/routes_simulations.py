"""
api/routes_simulations.py — роутер симуляцій і звітів.

Роутер нічого не рахує сам — тільки:
  1. Отримує HTTP запит
  2. Конвертує pydantic-схему в domain.Simulation
  3. Передає в SimulationService
  4. Повертає результат або HTTP помилку
"""
import traceback

from fastapi import APIRouter, Depends, HTTPException, Response

from dependencies import get_simulation_service
from domain.entities import Simulation
from schemas.simulation_schemas import SimulationRequest
from services.simulation_service import SimulationService
from utils.pdf_generator import generate_pdf_report

router = APIRouter(prefix="/api", tags=["simulation"])

_CRYPTO_SHORTCUTS = {
    "BTC", "ETH", "SOL", "BNB", "XRP",
    "DOGE", "ADA", "DOT", "LTC", "AVAX",
}


def _normalize_ticker(ticker: str) -> str:
    """Очищає тикер і додає -USD для популярних криптовалют."""
    t = ticker.upper().strip()
    return f"{t}-USD" if t in _CRYPTO_SHORTCUTS else t


def _to_simulation(req: SimulationRequest) -> Simulation:
    """Конвертує pydantic-схему у доменну сутність."""
    return Simulation(
        ticker=_normalize_ticker(req.ticker),
        algorithm=req.algorithm,
        horizon=req.horizon,
        simulations=req.simulations,
        var_confidence=req.var_confidence,
        risk_free_rate=req.risk_free_rate,
        scenario=getattr(req, "scenario", None),
        lookback_years=getattr(req, "lookback_years", 5),
    )


# -----------------------------------------------------------------------
# POST /api/simulate
# -----------------------------------------------------------------------

@router.post("/simulate")
def run_simulation(
    req: SimulationRequest,
    service: SimulationService = Depends(get_simulation_service),
):
    simulation = _to_simulation(req)
    print(f"🚀 Симуляція: {simulation.ticker} | {simulation.algorithm} | horizon={simulation.horizon}")
    try:
        return service.run(simulation)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------------------------------------------
# POST /api/report
# -----------------------------------------------------------------------

@router.post("/report")
def get_report(
    req: SimulationRequest,
    service: SimulationService = Depends(get_simulation_service),
):
    simulation = _to_simulation(req)
    try:
        sim_data = service.run(simulation)

        metrics = {
            "expected_price": sim_data["expected_price"],
            "var_5": sim_data["var_5"],
            "cvar_5": sim_data["cvar_5"],
            "volatility": sim_data["volatility"],
        }

        pdf_content = generate_pdf_report(metrics, sim_data["chart_data"], simulation.ticker)

        if isinstance(pdf_content, str):
            pdf_content = pdf_content.encode("latin1")
        elif isinstance(pdf_content, bytearray):
            pdf_content = bytes(pdf_content)

        safe_ticker = simulation.ticker.replace(",", "_").replace(" ", "")
        filename = f"RiskMate_Report_{safe_ticker}.pdf"

        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))