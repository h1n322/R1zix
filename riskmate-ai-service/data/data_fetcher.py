import yfinance as yf
import pandas as pd

def test_fetch_data(ticker="AAPL", period="1mo"):
    print(f"📡 З'єднуюсь з Yahoo Finance для отримання даних {ticker}...")
    
    # Завантажуємо дані за останній місяць
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    
    if df.empty:
        print("❌ Помилка: Дані не знайдено! Можливо, неправильний тікер.")
        return
        
    print("✅ Дані успішно завантажено!\n")
    print(f"📊 Останні 5 торгових днів для {ticker} (Ціна закриття):")
    
    # Показуємо тільки колонку Close (Ціна закриття) для останніх 5 днів
    print(df[['Close']].tail())

if __name__ == "__main__":
    test_fetch_data("AAPL")