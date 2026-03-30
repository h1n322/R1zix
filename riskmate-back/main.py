import stripe
import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Імпортуємо твої сервіси
from services.predict_service import predict_tomorrow_price
from services.portfolio_service import optimize_markowitz
from api.routes_simulations import router as simulations_router

# --- ІНІЦІАЛІЗАЦІЯ FIREBASE ---
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI(title="RiskMate API")

# Налаштовуємо CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- НАЛАШТУВАННЯ STRIPE ---
# Встав сюди свій секретний ключ з дашборду (sk_test_...)
stripe.api_key = "sk_test_51TAbCw6dO1aBEAhU5crvAdxY1bYNxEz1xZTspLnxfpOxYKoNirLCnoR8OEKZf314IcvJLbQBRJBocRQ4M1BG0rlw00MOPtzlPo"

# --- 1. WEBHOOK: МАГІЯ АВТОМАТИЗАЦІЇ ОПЛАТИ ---
@app.post("/api/webhook")
async def stripe_webhook(request: Request):
    payload = await request.json()
    
    # Пряма логіка без перевірки підпису (ідеально для локальної демонстрації МАН)
    if payload.get('type') == 'checkout.session.completed':
        session = payload['data']['object']
        user_email = session.get('customer_details', {}).get('email')
        
        if user_email:
            print(f"💰 Оплата успішна для {user_email}")
            users_ref = db.collection("users")
            # Шукаємо користувача за email
            query = users_ref.where("email", "==", user_email).limit(1).get()
            for doc in query:
                doc.reference.update({"tier": "pro"})
                print(f"✅ Статус 'pro' оновлено у Firestore!")
                
    return {"status": "success"}

# --- 2. ШТУЧНИЙ ІНТЕЛЕКТ (LSTM) ---
@app.get("/api/predict/{ticker}")
def get_prediction(ticker: str):
    price = predict_tomorrow_price(ticker.upper())
    if price is None:
        return {"error": f"Не вдалося зробити прогноз для {ticker}."}
    return {
        "ticker": ticker.upper(),
        "predicted_price_tomorrow": round(float(price), 2),
        "message": "Прогноз згенеровано успішно за допомогою LSTM"
    }

# --- 3. ОПТИМІЗАЦІЯ ПОРТФЕЛЯ (МАРКОВІЦ) ---
class OptimizeRequest(BaseModel):
    tickers: str

@app.post("/api/optimize")
def optimize_portfolio(request: OptimizeRequest):
    ticker_list = [t.strip().upper() for t in request.tickers.split(",") if t.strip()]
    if len(ticker_list) < 2:
         return {"error": "Потрібно мінімум 2 тикери."}
    return optimize_markowitz(ticker_list)

# --- 4. ІНШІ РОУТИ ---
app.include_router(simulations_router)

@app.get("/")
def read_root():
    return {"message": "RiskMate API працює на повну! 🚀"}