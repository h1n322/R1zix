import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

// Функція для форматування чисел (щоб не були довгими)
const formatNum = (num, isPercent = false) => {
  if (num === null || num === undefined) return isPercent ? '0%' : '$0';
  
  const absNum = Math.abs(num);
  let value = isPercent ? (num * 100).toFixed(1) : absNum.toFixed(2);
  
  if (!isPercent && value > 1000) {
    // Форматування для великих чисел типу $1.2K
    value = (absNum / 1000).toFixed(1) + 'K';
  }
  
  return isPercent ? `${value}%` : `$${value}`;
};

const KpiCards = ({ metrics, varConf }) => {
  // Дані-заглушки, якщо Metrics == null
  const data = metrics || {
    expected_price: 261.82,
    var_abs: 30.84,
    es_abs: 36.86,
    expected_return_ann: 0.181,
    var_conf: 0.95
  };

  const currentVarConf = varConf || data.var_conf || 0.95;

  return (
    <View style={styles.container}>
      {/* Рядок 1 */}
      <View style={styles.cardRow}>
        {/* Картка 1: Ціна */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Цільова Ціна</Text>
            <Text style={styles.kpiChange}>(Поточна)</Text>
          </View>
          <Text style={styles.kpiValue} numberOfLines={1}>{formatNum(data.expected_price)}</Text>
        </View>

        {/* Картка 2: Ризик VaR */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Ризик (VaR)</Text>
            <Text style={[styles.kpiChange, styles.riskLabel]}>{formatNum(currentVarConf, true)} conf.</Text>
          </View>
          <Text style={[styles.kpiValue, styles.riskValue]} numberOfLines={1}>{formatNum(data.var_abs)}</Text>
        </View>
      </View>

      {/* Рядок 2 */}
      <View style={styles.cardRow}>
        {/* Картка 3: ES */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Найгірший сценарій (ES)</Text>
          </View>
          <Text style={[styles.kpiValue, styles.esValue]} numberOfLines={1}>{formatNum(data.es_abs)}</Text>
        </View>

        {/* Картка 4: Дохідність */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Очікувана Дохідність</Text>
          </View>
          <Text style={[styles.kpiValue, styles.returnText]} numberOfLines={1}>{formatNum(data.expected_return_ann, true)} (Річна)</Text>
        </View>
      </View>
    </View>
  );
};

// --- СТИЛІ КОМПАКТНІ ДЛЯ MINI ---
const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  
  // Компактні картки
  card: { 
    // 👇 Адаптивна ширина: 48.5% ширини екрана за вирахуванням паддінґа
    width: (screenWidth - 32 - 10) / 2, // screenWidth - 2*main_padding - row_gap
    backgroundColor: '#1E293B', 
    borderRadius: 12, 
    // 👇 Зменшили відступи з 12 до 10
    padding: isSmallScreen ? 10 : 12, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: isSmallScreen ? 3 : 5 // Зменшили відступ
  },
  kpiTitle: { 
    color: '#94A3B8', 
    // 👇 Зменшили шрифт з 12 до 11
    fontSize: isSmallScreen ? 11 : 12, 
    fontWeight: '600', 
    flex: 1 // Щоб текст займав простір
  },
  kpiChange: { 
    color: '#64748B', 
    fontSize: isSmallScreen ? 8 : 10, 
    marginLeft: 4, 
    textAlign: 'right' 
  },
  
  kpiValue: { 
    color: '#F8FAFC', 
    // 👇 Зменшили шрифт з 18 до 16
    fontSize: isSmallScreen ? 16 : 18, 
    fontWeight: 'bold' 
  },
  
  riskValue: { color: '#EF4444' }, // Червоний для VaR
  esValue: { color: '#F97316' },   // Помаранчевий для ES
  riskLabel: { color: '#EF4444' },
  returnText: { color: '#F8FAFC' }
});

export default KpiCards;