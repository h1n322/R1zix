from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from dependencies import get_portfolio_service
from domain.entities import Portfolio
from services.portfolio_service import PortfolioService

router = APIRouter(prefix="/api", tags=["portfolio"])


class OptimizeRequest(BaseModel):
    tickers: str
    risk_free_rate: float = 0.045


@router.post("/optimize")
def optimize_portfolio(
    req: OptimizeRequest,
    service: PortfolioService = Depends(get_portfolio_service),
):
    tickers = [t.strip().upper() for t in req.tickers.split(",") if t.strip()]
    portfolio = Portfolio(tickers=tickers, risk_free_rate=req.risk_free_rate)

    try:
        result = service.optimize(portfolio)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    return result