"""
api/routes_webhook.py — Stripe webhook для оновлення tier після оплати.

Firebase тут не імпортується напряму — UserService отримує
готовий db_client через DI (get_user_service у dependencies.py).
"""
from fastapi import APIRouter, Depends, Request

from dependencies import get_user_service
from services.user_service import UserService

router = APIRouter(prefix="/api", tags=["payments"])


# -----------------------------------------------------------------------
# POST /api/webhook
# -----------------------------------------------------------------------

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    user_service: UserService = Depends(get_user_service),
):
    """
    Stripe надсилає POST при успішній оплаті.
    Ми знаходимо користувача у Firestore і оновлюємо tier → 'pro'.
    """
    payload = await request.json()

    if payload.get("type") == "checkout.session.completed":
        session = payload.get("data", {}).get("object", {})
        email = session.get("customer_details", {}).get("email")

        if email:
            success = user_service.upgrade_to_pro(email)
            if success:
                print(f"💰 Оплата підтверджена, {email} → pro")
            else:
                print(f"⚠️  Не знайдено користувача {email} у Firestore")

    return {"status": "success"}