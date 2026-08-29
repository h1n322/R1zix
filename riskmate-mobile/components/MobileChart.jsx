import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

const TIMEFRAMES = [
  { label: '1 ТИЖ', value: '1W', days: 5 },
  { label: '1 МІС', value: '1M', days: 21 },
  { label: '6 МІС', value: '6M', days: 126 },
  { label: '1 РІК', value: '1Y', days: 252 },
  { label: 'УСІ', value: 'ALL', days: 0 }
];

const MobileChart = ({ data }) => {
  const [timeframe, setTimeframe] = useState('1Y');

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Введіть тикер та натисніть "Аналіз"</Text>
      </View>
    );
  }

  const chartWidth = screenWidth - 32 - 30;

  // Фільтруємо дані залежно від обраного таймфрейму
  const displayData = useMemo(() => {
    // Розділяємо на історію та прогноз
    const historyItems = data.filter(item => item.history !== undefined && item.history !== null);
    const forecastItems = data.filter(item => item.history === undefined || item.history === null);

    const selectedTf = TIMEFRAMES.find(t => t.value === timeframe);
    let slicedHistory = historyItems;

    if (selectedTf && selectedTf.days > 0 && historyItems.length > selectedTf.days) {
      slicedHistory = historyItems.slice(historyItems.length - selectedTf.days);
    }

    // Об'єднуємо обрізану історію та весь прогноз
    let allPoints = [...slicedHistory, ...forecastItems].map((item) => {
      const val = item.history !== undefined && item.history !== null ? item.history : item.forecast;
      return { value: Number(val) };
    });

    // Видаляємо нульові або некоректні точки, щоб не було "дірок"
    return allPoints.filter(p => !isNaN(p.value) && p.value > 0);
  }, [data, timeframe]);

  // Визначаємо тренд (чи остання точка вища за першу)
  const isUp = displayData.length > 0 && displayData[displayData.length - 1].value >= displayData[0].value;
  const chartColor = isUp ? '#34C759' : '#FF3B30'; // Зелений або Червоний як в Apple Stocks

  const exactSpacing = chartWidth / Math.max(1, displayData.length - 1);

  return (
    <View style={styles.chartWrapper}>
      
      {/* Таймфрейми */}
      <View style={styles.timeframeRow}>
        {TIMEFRAMES.map((tf) => {
          const isActive = tf.value === timeframe;
          return (
            <TouchableOpacity 
              key={tf.value} 
              style={[styles.tfButton, isActive && styles.tfButtonActive]}
              onPress={() => setTimeframe(tf.value)}
            >
              <Text style={[styles.tfText, isActive && styles.tfTextActive]}>{tf.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <LineChart
        key={timeframe} // Перемальовуємо при зміні
        data={displayData}
        color={chartColor}
        thickness={2}
        width={chartWidth} 
        height={220} 
        hideDataPoints 
        spacing={exactSpacing}
        initialSpacing={0}
        endSpacing={0}
        
        // Заливка градієнтом
        areaChart 
        startFillColor={chartColor}
        startOpacity={0.3}
        endFillColor={chartColor}
        endOpacity={0.05}  
        
        // Осі та сітка
        yAxisColor="transparent"
        xAxisColor="transparent"
        yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
        hideRules={false}
        rulesColor="#1C1C1E"
        rulesType="solid"
        yAxisLabelWidth={40} 
        hideOrigin
        
        isAnimated
        animationDuration={500}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    backgroundColor: '#000000', // Темний фон як в Stocks
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    marginBottom: 40,
    overflow: 'hidden',
  },
  timeframeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  tfButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tfButtonActive: {
    backgroundColor: '#1C1C1E',
  },
  tfText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  tfTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    height: 250,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  }
});

export default MobileChart;