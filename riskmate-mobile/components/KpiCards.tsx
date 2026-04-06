import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

// Оновлена функція з правильними типами для TypeScript
const formatNum = (num: number | string | null | undefined, isPercent: boolean = false, multiply: boolean = true) => {
  if (num === null || num === undefined) return isPercent ? '0%' : '$0';
  
  const parsedNum = Number(num);
  const absNum = Math.abs(parsedNum);
  
  let value = isPercent ? (multiply ? absNum * 100 : absNum).toFixed(1) : absNum.toFixed(2);
  
  if (!isPercent && absNum > 1000) { 
    value = (absNum / 1000).toFixed(1) + 'K';
  }
  
  const sign = parsedNum < 0 ? '-' : '';
  return isPercent ? `${sign}${value}%` : `${sign}$${value}`;
};

const KpiCards = ({ metrics, varConf }: { metrics?: any, varConf?: number }) => {
  // 👇 САМЕ ЦІ КЛЮЧІ МАЮТЬ БУТИ ТУТ:
  const data = metrics || {
    expected_price: 261.82,
    var_5: 30.84,      
    cvar_5: 36.86,     
    return_pct: 18.1,  
    var_conf: 0.95
  };

  const currentVarConf = varConf || data.var_conf || 0.95;

  return (
    <View style={styles.container}>
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Цільова Ціна</Text>
            <Text style={styles.kpiChange}>(Поточна)</Text>
          </View>
          <Text style={styles.kpiValue} numberOfLines={1}>{formatNum(data.expected_price)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Ризик (VaR)</Text>
            <Text style={[styles.kpiChange, styles.riskLabel]}>{formatNum(currentVarConf, true, true)} conf.</Text>
          </View>
          {/* 👇 Виводимо var_5 */}
          <Text style={[styles.kpiValue, styles.riskValue]} numberOfLines={1}>{formatNum(data.var_5)}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Найгірший сценарій (ES)</Text>
          </View>
          {/* 👇 Виводимо cvar_5 */}
          <Text style={[styles.kpiValue, styles.esValue]} numberOfLines={1}>{formatNum(data.cvar_5)}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.kpiTitle} numberOfLines={1}>Очікувана Дохідність</Text>
          </View>
          {/* 👇 Виводимо return_pct */}
          <Text style={[styles.kpiValue, styles.returnText]} numberOfLines={1}>
            {formatNum(data.return_pct, true, false)} (Річна)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  card: { width: (screenWidth - 32 - 10) / 2, backgroundColor: '#1E293B', borderRadius: 12, padding: isSmallScreen ? 10 : 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSmallScreen ? 3 : 5 },
  kpiTitle: { color: '#94A3B8', fontSize: isSmallScreen ? 11 : 12, fontWeight: '600', flex: 1 },
  kpiChange: { color: '#64748B', fontSize: isSmallScreen ? 8 : 10, marginLeft: 4, textAlign: 'right' },
  kpiValue: { color: '#F8FAFC', fontSize: isSmallScreen ? 16 : 18, fontWeight: 'bold' },
  riskValue: { color: '#EF4444' }, 
  esValue: { color: '#F97316' },   
  riskLabel: { color: '#EF4444' },
  returnText: { color: '#F8FAFC' }
});

export default KpiCards;