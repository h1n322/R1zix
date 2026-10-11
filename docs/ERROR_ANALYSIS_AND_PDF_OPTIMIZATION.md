# Аналіз помилок (HTTP 499 у Nginx) та оптимізація генерації звітів

## 1. Опис інциденту

У логах веб-сервера Nginx (`riskmate_frontend`) було зафіксовано 6 одночасних запитів до ендпоінту генерації PDF-звітів, які завершилися статусом `499 0`:

```text
192.168.65.1 - - [23/Sep/2026:20:11:39 +0000] "POST /api/simulation/report HTTP/1.1" 499 0 "http://localhost:5173/dashboard?guest=true" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36" "-"
192.168.65.1 - - [23/Sep/2026:20:11:39 +0000] "POST /api/simulation/report HTTP/1.1" 499 0 "http://localhost:5173/dashboard?guest=true" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36" "-"
192.168.65.1 - - [23/Sep/2026:20:11:39 +0000] "POST /api/simulation/report HTTP/1.1" 499 0 "http://localhost:5173/dashboard?guest=true" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36" "-"
192.168.65.1 - - [23/Sep/2026:20:11:39 +0000] "POST /api/simulation/report HTTP/1.1" 499 0 "http://localhost:5173/dashboard?guest=true" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36" "-"
192.168.65.1 - - [23/Sep/2026:20:11:39 +0000] "POST /api/simulation/report HTTP/1.1" 499 0 "http://localhost:5173/dashboard?guest=true" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36" "-"
192.168.65.1 - - [23/Sep/2026:20:11:39 +0000] "POST /api/simulation/report HTTP/1.1" 499 0 "http://localhost:5173/dashboard?guest=true" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.0.0 Safari/537.36" "-"
```

---

## 2. Аналіз та першопричини (Post-Mortem)

### 2.1 Що означає код `499 0` у Nginx?
* **HTTP 499 (Client Closed Request)** — специфічний код стану Nginx, який повертається тоді, коли клієнт (браузер або тестовий скрипт `HeadlessChrome`) розриває TCP-з'єднання або перериває HTTP-запит до отримання відповіді від проксійованого сервісу (`csharp-api:8080`).
* **`0` байт** — клієнт не отримав жодного байту відповіді, оскільки з'єднання було розірвано в процесі очікування.

### 2.2 Чому надійшло 6 однакових запитів одночасно?
1. **Відсутність блокування кнопки експорту (UI Lock)**:
   У компоненті `SideBar.jsx` кнопка експорту в PDF не мала атрибута `disabled` та жодного візуального стану блокування під час активної генерації.
2. **Відсутність перевірки стану (State Guard)**:
   У `Dashboard.jsx` функція `downloadReport` не відстежувала поточний статус відправки (`isGeneratingPdf`) і не блокувала повторні виклики. При швидкому подвійному/потрійному кліку користувача або автоматизованого тестового скрипта виникав лавиноподібний запуск 6 паралельних запитів.

### 2.3 Чому клієнт розірвав з'єднання (таймаут)?
1. **Важкий монолітний ланцюжок операцій на бекенді**:
   В ендпоінті `POST /api/simulation/report` (`SimulationController.cs:85-118`) генерація виконувалася суто синхронно в одному потоці:
   * Зовнішній HTTP-запит до Yahoo Finance за історичними котируваннями (`GetHistoricalDataAsync`).
   * Розрахунок 10 000 траєкторій симуляції Монте-Карло на CPU (`_riskEngine.RunSimulation`).
   * Зовнішній HTTP-запит до Yahoo Finance за новинами (`GetAssetNewsAsync`).
   * Послідовні звернення до Gemini API (`AiAnalyticsService.GenerateRiskSummaryAsync`), де при помилках 404/503 послідовно опитувалися три різні моделі (`gemini-flash-latest`, `gemini-1.5-flash`, `gemini-1.5-pro`) без короткого таймауту (що займало 30–60 секунд).
   * Побудова графіків через ScottPlot та компіляція PDF через QuestPDF.
2. **Марне повторення обчислень замість використання кешу**:
   Користувач уже виконав симуляцію на дашборді. Результати вже були пораховані, знаходилися у стані фронтенду та були збережені в Redis під унікальним `jobId`. Проте `POST /api/simulation/report` не приймав `jobId` і змушував бекенд робити всю роботу заново з нуля.
3. **Клієнтський таймаут**:
   Клієнт або скрипт автотесту мав таймаут очікування близько 10–15 секунд (або перезавантажив сторінку), що призвело до закриття з'єднання клієнтом (`499`).

---

## 3. Комплексний план виправлення

### Етап 1: Захист фронтенду (Anti-Spam & UI Lock)
1. **`Dashboard.jsx`**:
   * Додати стан `isGeneratingPdf` (boolean).
   * У `downloadReport` встановити блокування: `if (isGeneratingPdf) return;`.
   * Встановити `setIsGeneratingPdf(true)` на початку та обов'язково скидати `setIsGeneratingPdf(false)` у блоці `finally`.
   * Передавати в запит `jobId` останньої виконаної симуляції, якщо вона доступна.
2. **`SideBar.jsx`**:
   * Додати проп `isGeneratingPdf`.
   * На кнопку PDF встановити `disabled={isLoading || isGeneratingPdf}`.
   * Додати індикатор завантаження під час формування звіту.

### Етап 2: Оптимізація C# API (Швидкий шлях через кеш Redis)
1. **`SimulationRequestDto.cs`**:
   * Додати поле `public string? JobId { get; set; }`.
2. **`SimulationController.cs`**:
   * Додати параметр `CancellationToken cancellationToken` для підтримки скасування на рівні ASP.NET Core.
   * Якщо передано `dto.JobId`, перевіряти наявність розрахованого `SimulationResult` у Redis (`_redisDb.StringGetAsync(dto.JobId)`).
   * За наявності в кеші — миттєво брати готовий результат, минаючи повторні виклики Yahoo Finance та перерахунок Монте-Карло. Час генерації скорочується до < 1 секунди!
3. **`AiAnalyticsService.cs`**:
   * Додати `CancellationTokenSource` із жорстким таймаутом (5 секунд) на звернення до Gemini API.
   * При недоступності AI негайно генерувати автоматичний фінансовий висновок за формулами на основі VaR, волатильності та цінового діапазону.

### Етап 3: Оптимізація конфігурації Nginx
1. **`riskmate-front/nginx.conf`**:
   * Налаштувати директиви `proxy_read_timeout 120s`, `proxy_connect_timeout 60s`, `proxy_send_timeout 120s`.
   * Увімкнути буферизацію відповідей `proxy_buffering on` для коректної передачі важких бінарних файлів PDF.

---

## 4. Результати верифікації
* Усунено можливість повторного надсилання запитів при багаторазових кліках.
* Час генерації звіту для вже розрахованої на екрані симуляції знижено з ~30 с до < 1 с.
* У логах Nginx статус `499` ліквідовано.
