import os
from dotenv import load_dotenv
import stripe
import firebase_admin
from firebase_admin import credentials
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes_simulations import router as simulations_router
from api.routes_portfolio import router as portfolio_router
from api.routes_market import router as market_router
from api.routes_webhook import router as webhook_router

# Завантажуємо змінні середовища
load_dotenv() 

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Беремо ключ безпечно з .env
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

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