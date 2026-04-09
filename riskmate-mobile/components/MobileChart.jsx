import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

const MobileChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Введіть тикер та натисніть "Аналіз"</Text>
      </View>
    );
  }

  const chartWidth = screenWidth - 32 - 30;

  // --- 1. ГОТУЄМО ДВІ ОКРЕМІ ЛІНІЇ ---
  const historyData = [];
  const forecastData = [];
  
  let splitIndex = 0; // Точка, де минуле переходить у майбутнє

  // Шукаємо, де закінчується історія
  data.forEach((item, index) => {
    if (item.history !== undefined) {
      splitIndex = index;
    }
  });

  // Заповнюємо масиви
  data.forEach((item, index) => {
    const step = Math.max(1, Math.floor(data.length / 6)); 
    const label = index % step === 0 ? item.name.substring(5, 10) : '';

    if (index <= splitIndex) {
      // Зелена лінія (Історія)
      historyData.push({ value: Number(item.history), label });
    } 
    
    // ВАЖЛИВО: Прогноз має починатися з останньої точки історії, щоб лінії "зшилися"!
    if (index >= splitIndex) {
      // Синя лінія (Прогноз)
      const val = item.history !== undefined ? item.history : item.forecast;
      forecastData.push({ value: Number(val), label: index === splitIndex ? '' : label });
    }
  });

  const exactSpacing = chartWidth / Math.max(1, data.length - 1);

  return (
    <View style={styles.chartWrapper}>
      <Text style={styles.chartTitle}>Динаміка ціни & Монте-Карло</Text>
      
      <LineChart
        // --- ПЕРША ЛІНІЯ (ІСТОРІЯ) ---
        data={historyData}
        color="#10B981" // Зелений суцільний
        thickness={2.5}
        
        // --- ДРУГА ЛІНІЯ (ПРОГНОЗ) ---
        data2={forecastData}
        startIndex2={splitIndex} // Вказуємо, з якої точки почати малювати другу лінію
        color2="#3B82F6" // Синій
        thickness2={2.5}
        strokeDashArray2={[5, 4]} // Пунктир тільки для прогнозу!

        // Загальні налаштування графіка
        width={chartWidth} 
        height={isSmallScreen ? 180 : 220} 
        hideDataPoints 
        spacing={exactSpacing}
        initialSpacing={0}
        endSpacing={0}
        
        // Легкі градієнти під графіками
        areaChart 
        startFillColor="#10B981" 
        startFillColor2="#3B82F6"
        startOpacity={0.15}
        endOpacity={0}  
        
        // Осі та сітка
        yAxisColor="#334155"
        xAxisColor="#334155"
        yAxisTextStyle={{ color: '#94A3B8', fontSize: 9 }}
        xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 9 }}
        rulesColor="#1E293B"
        rulesType="dashed"
        yAxisLabelWidth={40} 
        
        isAnimated
        animationDuration={1200}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    backgroundColor: '#1E293B',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 40,
    overflow: 'hidden',
  },
  chartTitle: {
    color: '#F8FAFC',
    fontSize: isSmallScreen ? 14 : 16, 
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 10,
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