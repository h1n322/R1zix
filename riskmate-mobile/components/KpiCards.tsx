import React from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

const formatNum = (num: number | string | null | undefined, isPercent: boolean = false, prefix: string = '') => {
  if (num === null || num === undefined) return isPercent ? '0.00%' : `${prefix}0.00`;
  const parsedNum = Number(num);
  const absNum = Math.abs(parsedNum);
  const value = absNum.toFixed(2);
  const sign = parsedNum < 0 ? '-' : '';
  return isPercent ? `${sign}${value}%` : `${sign}${prefix}${value}`;
};

const KpiCard = ({ title, value, color = '#F8FAFC', tooltip = '', isPercent = false, prefix = '' }: any) => {
  const showTooltip = () => {
    if (tooltip) {
      Alert.alert(title, tooltip);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.kpiTitle} numberOfLines={1}>{title}</Text>
        {tooltip ? (
          <TouchableOpacity onPress={showTooltip} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="information-circle-outline" size={14} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={[styles.kpiValue, { color }]} numberOfLines={1}>
        {formatNum(value, isPercent, prefix)}
      </Text>
    </View>
  );
};

const KpiCards = ({ metrics, varConf, algorithm }: { metrics?: any, varConf?: number, algorithm?: string }) => {
  const isMarkowitz = algorithm === 'markowitz';
  const confLevel = varConf ? (varConf * 100).toFixed(0) : 95;
  const varTitle = `Макс. ризик (${confLevel}%)`;
  
  const expectedPrice = metrics?.expected_price ?? metrics?.expectedPrice ?? 0;
  const var5 = metrics?.var_5 ?? metrics?.valueAtRisk ?? 0;
  const cvar5 = metrics?.cvar_5 ?? metrics?.conditionalValueAtRisk ?? 0;
  const rawVol = Number(metrics?.volatility ?? metrics?.annualVolatility ?? 0);
  const volatility = (rawVol > 0 && rawVol <= 1.0) ? rawVol * 100 : rawVol;
  const sharpeRatio = metrics?.sharpe_ratio ?? metrics?.sharpeRatio ?? 0;
  const maxDrawdown = metrics?.max_drawdown ?? metrics?.maxDrawdown ?? 0;

  return (
    <View style={styles.container}>
      <KpiCard 
        title={isMarkowitz ? "Очікувана дохідність" : "Очікувана ціна"} 
        value={expectedPrice} 
        prefix={isMarkowitz ? "" : "$"}
        isPercent={isMarkowitz}
        color="#10B981" // Зелений
        tooltip={isMarkowitz ? "Середньорічна очікувана дохідність оптимізованого портфеля." : "Найбільш ймовірна ціна активу в кінці обраного періоду."}
      />
      <KpiCard 
        title={varTitle} 
        value={Math.abs(var5)} 
        prefix={isMarkowitz ? "" : "$"}
        color="#EF4444" // Червоний
        tooltip={`З імовірністю ${confLevel}% ваші збитки не перевищать цю суму.`}
      />
      <KpiCard 
        title="Екстрем. ризик (ES)" 
        value={Math.abs(cvar5)} 
        prefix={isMarkowitz ? "" : "$"}
        color="#F8FAFC"
        tooltip="Середній очікуваний збиток у найгірших сценаріях."
      />
      <KpiCard 
        title="Волатильність" 
        value={volatility}
        isPercent={true}
        color="#3B82F6" // Синій
        tooltip="Показник того, наскільки сильно коливалася ціна."
      />
      <KpiCard 
        title="Коеф. Шарпа" 
        value={sharpeRatio}
        color={Number(sharpeRatio) >= 0 ? "#A855F7" : "#EF4444"}
        tooltip="Показує дохідність на одиницю ризику. Чим вище, тим краще."
      />
      <KpiCard 
        title="Макс. просадка" 
        value={Math.abs(maxDrawdown)}
        isPercent={true}
        color="#EC4899" // Рожевий
        tooltip="Найбільше падіння ціни від пікового значення до мінімуму."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginBottom: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: { 
    width: '48%', // Займає половину ширини з невеликим відступом (2x3 grid)
    backgroundColor: '#0B0E14', 
    borderRadius: 12, 
    padding: isSmallScreen ? 10 : 12, 
    borderWidth: 1, 
    borderColor: '#1F2937',
    marginBottom: 10,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  kpiTitle: { 
    color: '#94A3B8', 
    fontSize: isSmallScreen ? 10 : 11, 
    fontWeight: '600', 
    flex: 1,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  kpiValue: { 
    fontSize: isSmallScreen ? 16 : 18, 
    fontWeight: 'bold' 
  },
});

export default KpiCards;
