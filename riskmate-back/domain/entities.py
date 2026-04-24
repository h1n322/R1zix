from dataclasses import dataclass, field
from typing import Optional


@dataclass
class User:
    uid: str
    email: str
    tier: str = "free"  # "free" | "pro"

    @property
    def is_pro(self) -> bool:
        return self.tier == "pro"


@dataclass
class Portfolio:
    tickers: list[str]
    risk_free_rate: float = 0.045

    def validate(self) -> None:
        if len(self.tickers) < 2:
            raise ValueError("Потрібно мінімум 2 тикери для оптимізації портфеля")
        if any(not t.strip() for t in self.tickers):
            raise ValueError("Тикер не може бути порожнім рядком")


@dataclass
class Simulation:
    ticker: str
    algorithm: str
    horizon: int
    simulations: int
    var_confidence: float
    risk_free_rate: float
    scenario: Optional[str] = None
    lookback_years: int = 5

    def validate(self) -> None:
        if self.horizon <= 0:
            raise ValueError("Горизонт симуляції має бути більше 0")
        if self.simulations <= 0:
            raise ValueError("Кількість симуляцій має бути більше 0")
        valid_algorithms = {"gbm", "garch", "historical", "merton", "stress", "backtest"}
        if self.algorithm not in valid_algorithms:
            raise ValueError(f"Невідомий алгоритм: {self.algorithm}")
        if self.algorithm == "stress" and not self.scenario:
            raise ValueError("Для stress-тесту потрібно вказати scenario")