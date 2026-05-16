<div align="center">

# RiskMate

**Система прогнозування фінансових ризиків та оптимізації інвестиційних портфелів**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?style=flat-square&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)

*Науково-дослідницька робота — Мала академія наук України*

</div>

---

## Зміст

- [Про проєкт](#про-проєкт)
- [Функціонал](#функціонал)
- [Технічний стек](#технічний-стек)
- [Архітектура](#архітектура)
- [Встановлення та запуск](#встановлення-та-запуск)
- [API Reference](#api-reference)
- [Конфігурація](#конфігурація)
- [Скриншоти](#скриншоти)

---

## Про проєкт

RiskMate — комплексна веб-платформа, що поєднує **класичні мікроекономічні моделі** з **алгоритмами машинного навчання** для оцінки волатильності фінансових активів. Система підтримує аналіз як традиційних акцій, так і криптовалют, надаючи інвесторам інструменти для кількісної оцінки ризику та побудови оптимального портфеля.

Проєкт розроблено як інструмент для поглибленого вивчення фінансової інженерії та ризик-менеджменту.

---

## Функціонал

| Модуль | Опис |
|--------|------|
| **Симуляція Монте-Карло** | Генерація тисяч цінових сценаріїв на основі геометричного броунівського руху (GBM) |
| **VaR та CVaR** | Розрахунок Value at Risk і Conditional Value at Risk з урахуванням "товстих хвостів" розподілу |
| **LSTM-нейромережа** | Аналіз часових рядів і прогнозування цін на базі TensorFlow |
| **Модель Марковіца** | Оптимізація портфеля за співвідношенням дохідності і ризику з урахуванням кореляції активів |
| **Інтерактивний дашборд** | Візуалізація даних у реальному часі з підтримкою професійних фінансових графіків |
| **Аутентифікація** | Firebase Auth з підтримкою Google OAuth |
| **Система підписок** | Stripe Payments з обробкою вебхуків |

---

## Технічний стек

### Backend
- **Python 3.12** + **FastAPI** — REST API сервер
- **Pandas, NumPy, SciPy** — математичне моделювання
- **TensorFlow** — LSTM-нейромережа для аналізу часових рядів
- **arch** — GARCH-моделі волатильності
- **yfinance** — отримання ринкових даних у реальному часі

### Frontend
- **React 18** + **Vite** — SPA-додаток
- **Recharts / Lightweight Charts** — фінансові графіки та візуалізація
- **Tailwind CSS** — стилізація інтерфейсу

### Інфраструктура
- **Firebase** — аутентифікація користувачів та хмарна база даних
- **Stripe** — обробка платежів та керування підписками

---

## Архітектура

```
riskmate-back/
├── main.py                 # Точка входу, реєстрація роутерів
├── routers/                # API-маршрути (simulation, portfolio, auth)
├── services/               # Бізнес-логіка (Monte Carlo, Markowitz, VaR)
├── models/                 # LSTM-модель, Pydantic-схеми
└── requirements.txt

riskmate-front/
├── src/
│   ├── pages/              # Dashboard, Simulation, Portfolio, Pricing
│   ├── components/         # Переиспользуемые UI-компоненти та графіки
│   └── services/           # API-клієнт, Firebase SDK
├── vite.config.js
└── tailwind.config.js
```

---

## Встановлення та запуск

### Передумови

- Python 3.12+
- Node.js 18+
- Stripe CLI (для локального тестування вебхуків)

### 1. Backend

```bash
cd riskmate-back
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API буде доступне за адресою: `http://localhost:8000`  
Інтерактивна документація: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd riskmate-front
npm install
npm run dev
```

Додаток буде доступний за адресою: `http://localhost:5173`

### 3. Stripe Webhook (опціонально)

```bash
stripe listen --forward-to localhost:8000/api/webhook
```

---

## API Reference

| Метод | Маршрут | Опис |
|-------|---------|------|
| `POST` | `/api/simulate` | Запуск симуляції Монте-Карло |
| `POST` | `/api/portfolio/optimize` | Оптимізація портфеля (Марковіц) |
| `GET` | `/api/asset/{ticker}/history` | Історичні дані активу |
| `POST` | `/api/risk/var` | Розрахунок VaR та CVaR |
| `POST` | `/api/predict` | LSTM-прогноз ціни |
| `POST` | `/api/webhook` | Stripe webhook handler |

Повна документація генерується автоматично через Swagger UI за адресою `/docs`.

---

## Конфігурація

Створіть файли `.env` у відповідних директоріях:

**`riskmate-back/.env`**
```env
FIREBASE_CREDENTIALS=path/to/serviceAccountKey.json
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**`riskmate-front/.env`**
```env
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Скриншоти

![Dashboard](https://github.com/user-attachments/assets/ab27adc3-3652-4ada-a0f8-f25168c65c98)
![Monte Carlo Simulation](https://github.com/user-attachments/assets/7efd2a3e-4edf-4a68-a197-3e669ed59fdb)
![Portfolio Optimizer](https://github.com/user-attachments/assets/76301097-d391-4df7-8b09-dbd0dd1db3df)

---

<div align="center">

*Розроблено для Малої академії наук України*

</div>
