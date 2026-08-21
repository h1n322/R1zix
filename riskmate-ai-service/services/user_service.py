"""
UserService — управління користувачами через Firebase Firestore.

Firebase NoSQL не заважає маршрутизації FastAPI взагалі:
  - роутери не знають про Firebase
  - тільки цей сервіс працює з Firestore
  - все інше (симуляції, портфель) не торкається бази
"""
from domain.entities import User


class UserService:
    def __init__(self, db_client):
        """
        db_client — firebase_admin.firestore.client()
        Передається через DI, тому UserService не знає як ініціалізується Firebase.
        """
        self._db = db_client

    def get_by_email(self, email: str):
        """Знаходить користувача за email. Повертає None якщо не знайдено."""
        try:
            query = (
                self._db.collection("users")
                .where("email", "==", email)
                .limit(1)
                .get()
            )
            for doc in query:
                d = doc.to_dict()
                return User(
                    uid=doc.id,
                    email=d.get("email", email),
                    tier=d.get("tier", "free"),
                )
            return None
        except Exception as e:
            print(f"⚠️  UserService.get_by_email помилка: {e}")
            return None

    def get_by_uid(self, uid: str):
        """Знаходить користувача за Firebase UID."""
        try:
            doc = self._db.collection("users").document(uid).get()
            if doc.exists:
                d = doc.to_dict()
                return User(
                    uid=uid,
                    email=d.get("email", ""),
                    tier=d.get("tier", "free"),
                )
            return None
        except Exception as e:
            print(f"⚠️  UserService.get_by_uid помилка: {e}")
            return None

    def upgrade_to_pro(self, email: str) -> bool:
        """
        Оновлює tier користувача до 'pro'.
        Повертає True якщо успішно, False якщо користувача не знайдено.
        """
        try:
            query = (
                self._db.collection("users")
                .where("email", "==", email)
                .limit(1)
                .get()
            )
            for doc in query:
                doc.reference.update({"tier": "pro"})
                print(f"✅ {email} оновлено до pro")
                return True
            print(f"⚠️  Користувача {email} не знайдено у Firestore")
            return False
        except Exception as e:
            print(f"⚠️  UserService.upgrade_to_pro помилка: {e}")
            return False

    def create_user(self, uid: str, email: str, tier: str = "free") -> User:
        """Створює нового користувача у Firestore."""
        try:
            self._db.collection("users").document(uid).set(
                {"email": email, "tier": tier}
            )
            return User(uid=uid, email=email, tier=tier)
        except Exception as e:
            print(f"⚠️  UserService.create_user помилка: {e}")
            raise

    def check_pro_access(self, email: str) -> bool:
        """Перевіряє чи має користувач pro доступ."""
        user = self.get_by_email(email)
        return user.is_pro if user else False
