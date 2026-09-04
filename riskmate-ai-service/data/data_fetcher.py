from utils.logger import logger
import yfinance as yf
import pandas as pd

def test_fetch_data(ticker="AAPL", period="1mo"):
    logger.info(f"📡 З'єднуюсь з Yahoo Finance для отримання даних {ticker}...")
    
    # Завантажуємо дані за останній місяць
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    
    if df.empty:
        logger.error("❌ Помилка: Дані не знайдено! Можливо, неправильний тікер.")
        return
        
    logger.info("✅ Дані успішно завантажено!\n")
    logger.info(f"📊 Останні 5 торгових днів для {ticker} (Ціна закриття):")
    
    # Показуємо тільки колонку Close (Ціна закриття) для останніх 5 днів
    logger.info(df[['Close']].tail())

if __name__ == "__main__":
    test_fetch_data("AAPL")