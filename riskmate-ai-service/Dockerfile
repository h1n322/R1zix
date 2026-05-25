# Використовуємо полегшений офіційний образ Python
FROM python:3.10-slim

# Забороняємо Python створювати .pyc файли та буферизувати вивід (корисно для логів)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Встановлюємо системні залежності (потрібні для компіляції деяких Data Science бібліотек)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Робоча директорія
WORKDIR /app

# Спочатку копіюємо ТІЛЬКИ requirements, щоб Docker закешував цей шар
COPY requirements.txt .

# Встановлюємо залежності без кешу pip (робить образ ще меншим)
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо весь інший код
COPY . .

# Відкриваємо порт
EXPOSE 8000

# Запускаємо сервер (заміни main:app на назву твого головного файлу)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]