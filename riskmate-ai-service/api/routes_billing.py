from utils.logger import logger
"""
api/routes_billing.py — Patreon webhook для оновлення tier після оплати.

Firebase тут не імпортується напряму — UserService отримує
готовий db_client через DI (get_user_service у dependencies.py).
"""
import os
import hmac
import hashlib
from fastapi import APIRouter, Depends, Request, HTTPException

from dependencies import get_user_service
from services.user_service import UserService

router = APIRouter(prefix="/api", tags=["payments"])

# Секретний ключ для перевірки вебхуків (створюється в панелі розробника Patreon)
PATREON_WEBHOOK_SECRET = os.getenv("PATREON_WEBHOOK_SECRET", "default_secret")


@router.post("/webhook")
async def patreon_webhook(
    request: Request,
    user_service: UserService = Depends(get_user_service),
):
    """
    Patreon надсилає POST-запит при створенні, оновленні або скасуванні підписки.
    Ми перевіряємо підпис (HMAC-MD5) для безпеки і оновлюємо статус користувача у Firestore.
    """
    # 1. Отримуємо сире тіло запиту (raw body) для перевірки підпису
    raw_body = await request.body()
    signature_header = request.headers.get("X-Patreon-Signature", "")
    event_name = request.headers.get("X-Patreon-Event", "")

    # 2. Генеруємо HMAC MD5 хеш на нашій стороні (Patreon використовує MD5)
    hash_obj = hmac.new(
        PATREON_WEBHOOK_SECRET.encode("utf-8"), 
        raw_body, 
        hashlib.md5
    )
    expected_signature = hash_obj.hexdigest()

    # Використовуємо hmac.compare_digest для безпечного порівняння (захист від timing attacks)
    if not hmac.compare_digest(signature_header, expected_signature):
        logger.error("⚠️ Помилка перевірки підпису Patreon (Невірний X-Patreon-Signature)!")
        raise HTTPException(status_code=401, detail="Invalid signature")

    # 3. Парсимо JSON після успішної перевірки підпису
    payload = await request.json()
    
    # Структура даних Patreon API v2
    data = payload.get("data", {})
    attributes = data.get("attributes", {})

    # Email патрона
    email = attributes.get("email")

    # 4. Обробляємо події успішної покупки або створення підписки
    if event_name in ["members:pledge:create", "members:pledge:update"] and email:
        success = user_service.upgrade_to_pro(email)
        if success:
            logger.info(f"💰 Оплата підтверджена (Patreon), {email} → pro")
        else:
            logger.error(f"⚠️ Оплату прийнято, але не знайдено користувача {email} у Firestore")
            
    # Додатково: Логіка на випадок скасування підписки
    elif event_name in ["members:pledge:delete"] and email:
        # На майбутнє: user_service.downgrade_to_free(email)
        logger.error(f"🛑 Підписка скасована для {email}")

    return {"status": "success"}
