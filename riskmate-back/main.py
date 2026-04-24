import stripe
import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes_simulations import router as simulations_router
from api.routes_portfolio import router as portfolio_router
from api.routes_market import router as market_router
from api.routes_webhook import router as webhook_router

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

stripe.api_key = "sk_test_51TAbCw6dO1aBEAhU5crvAdxY1bYNxEz1xZTspLnxfpOxYKoNirLCnoR8OEKZf314IcvJLbQBRJBocRQ4M1BG0rlw00MOPtzlPo"

app = FastAPI(title="RiskMate API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulations_router)
app.include_router(portfolio_router)
app.include_router(market_router)
app.include_router(webhook_router)

@app.get("/")
def health_check():
    return {"message": "RiskMate API працює 🚀"}