import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

// --- ОТРИМУЄМО РОЗМІРИ ЕКРАНА ---
const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

const MobileChart = ({ data }) => {
  // 1. Перевірка: якщо даних немає, показуємо красиву заглушку
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Введіть тикер та натисніть "Аналіз"</Text>
      </View>
    );
  }

  // 2. Адаптуємо дані під формат Gifted Charts
  const formattedData = data.map((item, index) => {
    // Беремо історію, а якщо її вже немає (почалося майбутнє) - беремо прогноз
    const val = item.history !== undefined ? item.history : item.forecast;
    
    // 👇 ОНОВЛЕНИЙ РОЗУМНИЙ ШАГ (ТІЛЬКИ 6 ДАТ)
    // Динамічний крок: показуємо максимум 6 підписів на весь графік
    const step = Math.max(1, Math.floor(data.length / 6)); 
    
    return {
      value: Number(val),
      // Показуємо підпис дати (ММ-ДД) тільки для кожної n-ї точки
      label: index % step === 0 ? item.name.substring(5, 10) : '', 
    };
  });

  // 👇 НОВА АДАПТИВНА ШИРИНА ГРАФІКА
  // Враховуємо main_padding (16*2), padding_wrapper (10*2)
  const chartWidth = screenWidth - 32 - 20;

  return (
    <View style={styles.chartWrapper}>
      <Text style={styles.chartTitle}>Динаміка ціни & Монте-Карло</Text>
      
      <LineChart
        areaChart // Вмикає заливку під графіком (градієнт)
        data={formattedData}
        // 👇 Передали адаптивну ширину
        width={chartWidth} 
        height={isSmallScreen ? 180 : 220} // Адаптивна висота
        hideDataPoints // Ховаємо кружечки на кожній точці, щоб лінія була плавною
        // 👇 Адаптивний спайсінг
        spacing={chartWidth / formattedData.length + 0.3}
        color="#3b82f6" // Синій колір лінії
        thickness={2.5}
        startFillColor="rgba(59, 130, 246, 0.4)" // Початок градієнта
        endFillColor="rgba(59, 130, 246, 0.0)"   // Кінець градієнта (прозорий)
        initialSpacing={0}
        
        // Стилізація осей (КОМПАКТНІША)
        yAxisColor="#334155"
        xAxisColor="#334155"
        yAxisTextStyle={{ color: '#94A3B8', fontSize: 9 }}
        xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 9 }}
        
        // Горизонтальні лінії (сітка)
        rulesColor="#1E293B"
        rulesType="dashed"
        yAxisLabelWidth={40} // Трохи зменшили ширину осей
        
        // Анімація при появі
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
  },
  chartTitle: {
    color: '#F8FAFC',
    fontSize: isSmallScreen ? 14 : 16, // Адаптивний шрифт
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