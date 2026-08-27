# 📋 План розвитку RiskMate: Монетизація та Хостинг

Наступний етап розвитку платформи RiskMate фокусується на підготовці проєкту до реального запуску (Production). Ми інтегруємо платіжну систему Stripe для розділення безкоштовних і платних функцій, а також розгорнемо додаток на безкоштовному хмарному сервері Oracle Cloud (Always Free Tier).

## 💰 Етап 1: Монетизація (Lemon Squeezy / MoR Integration)

**Ціль:** Створити систему підписок (Free / Pro), обмежити доступ до преміум-функцій та налаштувати автоматичну обробку платежів через Lemon Squeezy (дозволяє працювати без ФОП).

1. **Розмежування функціоналу (Free vs Pro):**
   - **Free (Basic):** Обмеження глибини історії (до 3 років), стандартний алгоритм (Classic GBM), базовий графік без AI-аналітики, відсутність PDF-звітів, обмеження до 1000 симуляцій Монте-Карло.
   - **Pro (Premium):** Доступ до 5-10 років історії, всі алгоритми (GARCH, Merton, LSTM AI, Markowitz), інтелектуальне AI-Summary, генерація PDF-звітів, до 10 000+ симуляцій.

2. **Backend (C# API):**
   - Додавання перевірки підписки (перевірка кастомних claims у JWT токені Firebase або звернення до БД) у контролерах `SimulationController` та `PortfolioController`.
   - Повернення помилки `403 Forbidden` із повідомленням "Оформіть Pro-підписку", якщо Basic-користувач обирає преміум-параметри.

3. **Frontend (React UI):**
   - Блокування (disable) преміум-опцій із додаванням позначки 👑 або "Pro".
   - Створення сторінки `Pricing` з таблицею порівняння планів.
   - Інтеграція Checkout-посилання від **Lemon Squeezy** на кнопку "Оформити підписку" (відкриває безпечне вікно оплати від MoR).

4. **Lemon Squeezy Webhooks (Бекенд):**
   - Створення Webhook-ендпоінту (`/api/webhook/lemonsqueezy`), який слухатиме події (наприклад, `subscription_created`, `subscription_updated`).
   - Валідація підпису вебхуку (HMAC) для безпеки.
   - Оновлення статусу користувача у БД та додавання Firebase Custom Claim ("pro: true").

## ☁️ Етап 2: Деплой на Oracle Cloud (Hosting)

**Ціль:** Отримати безкоштовний сервер від Oracle (Always Free Tier), налаштувати його та запустити проєкт у продакшн через Docker.

1. **Налаштування сервера (Oracle Cloud Infrastructure):**
   - Реєстрація в Oracle Cloud.
   - Створення Compute Instance (VM) на базі **ARM Ampere A1** (Oracle дає до 4 ядер і 24 ГБ оперативної пам'яті безкоштовно!) або стандартного AMD Micro.
   - Налаштування ОС: вибір Ubuntu Linux 22.04/24.04.
   - Налаштування VCN (Virtual Cloud Network) Security Lists в Oracle Cloud Dashboard для відкриття портів (80, 443 для HTTP/HTTPS, 22 для SSH).

2. **Підготовка середовища на сервері:**
   - Підключення до сервера по SSH.
   - Встановлення Docker та Docker Compose.
   - Клонування репозиторію з GitHub (`git clone https://github.com/h1n322/RiskMate-project.git`).
   - Створення `.env` файлів із production-ключами (Firebase, Stripe Live Keys, Gemini API).

3. **Веб-сервер та HTTPS (Nginx + Let's Encrypt):**
   - Додавання **Nginx** (reverse proxy) у наш `docker-compose.yml`.
   - Налаштування маршрутизації: всі запити на порт 80/443 перенаправляються:
     - `/api/simulation/*` -> C# Backend (port 5266)
     - `/api/*` -> Python ML (port 8000)
     - `/*` -> React Frontend (статика)
   - Отримання безкоштовного SSL-сертифікату через **Certbot (Let's Encrypt)**, щоб сайт працював по безпечному протоколу `https://`.

4. **Автоматизація (CI/CD) - Опціонально:**
   - Налаштування GitHub Actions, щоб при кожному `git push origin main` сервер автоматично підтягував оновлення (git pull) та перезапускав Docker контейнери.
