import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

const CandlestickChart = ({ data }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!chartContainerRef.current || !data || data.length === 0) return;

        let chart;

        try {
            // 1. Створюємо графік з УКРАЇНСЬКОЮ ЛОКАЛІЗАЦІЄЮ
            chart = createChart(chartContainerRef.current, {
                localization: {
                    locale: 'uk-UA', // Примусово ставимо українську мову для місяців
                },
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: '#A0AEC0',
                },
                grid: {
                    vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                    horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
                },
                width: chartContainerRef.current.clientWidth,
                height: chartContainerRef.current.clientHeight || 500,
                timeScale: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    timeVisible: true,
                },
                rightPriceScale: {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                },
            });
            
            chartRef.current = chart;

            // Налаштування кольорів свічок
            const candlestickSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#2ebd85',
                downColor: '#e0294a',
                borderVisible: false,
                wickUpColor: '#2ebd85',
                wickDownColor: '#e0294a',
            });

            // 2. БРОНЬОВАНА ОБРОБКА ДАНИХ
            const formattedData = data
                .filter(item => item.open !== undefined && item.close !== undefined && item.open !== "N/A")
                .map(item => ({
                    time: item.name, 
                    open: parseFloat(item.open),
                    high: parseFloat(item.high),
                    low: parseFloat(item.low),
                    close: parseFloat(item.close),
                }));

            if (formattedData.length > 0) {
                // Сортуємо суворо за часом
                formattedData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

                // Видаляємо дублікати
                const uniqueData = [];
                const seenDates = new Set();
                for (const item of formattedData) {
                    if (!seenDates.has(item.time)) {
                        seenDates.add(item.time);
                        uniqueData.push(item);
                    }
                }

                // Завантажуємо відфільтровані дані
                candlestickSeries.setData(uniqueData);
                chart.timeScale().fitContent();
            }

            // 3. Адаптивність при зміні розміру вікна
            const handleResize = () => {
                if (chartContainerRef.current && chart) {
                    chart.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            };
            window.addEventListener('resize', handleResize);

            // 4. Очищення пам'яті
            return () => {
                window.removeEventListener('resize', handleResize);
                if (chart) {
                    chart.remove();
                }
            };

        } catch (error) {
            console.error("🚨 Помилка рендеру свічок:", error);
        }

    }, [data]);

    return (
        <div
            ref={chartContainerRef}
            // Збільшена мінімальна висота для ідеального вигляду
            style={{ width: '100%', height: '100%', minHeight: window.innerWidth < 768 ? '350px' : '550px' }} 
        />
    );
};

export default CandlestickChart;