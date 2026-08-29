import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../firebase'; 

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5266';

export default function PortfolioScreen() {
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPortfolios = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Помилка', 'Ви не авторизовані');
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Помилка завантаження портфелів');
      
      const data = await response.json();
      setPortfolios(data);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Помилка', 'Не вдалося завантажити історію. Перевірте, чи працює C# бекенд.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Хелпер для форматування грошей ($1,234.56)
  const formatMoney = (val: any) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Кнопка "Назад" */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Історія симуляцій</Text>
        <Text style={styles.sectionLabel}>ЗБЕРЕЖЕНІ РОЗРАХУНКИ</Text>

        {isLoading ? (
          <ActivityIndicator color="#3B82F6" size="large" style={{ marginTop: 20 }} />
        ) : portfolios.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>У вас ще немає збережених симуляцій.</Text>
          </View>
        ) : (
          portfolios.map((p, index) => (
            <TouchableOpacity 
              key={p.id || index} 
              style={styles.portfolioCard}
              onPress={() => {
                Alert.alert("Інфо", `Тикери: ${p.tickers}\nМодель: ${p.algorithm}\nОчікувана ціна: $${formatMoney(p.expectedPrice)}`);
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.tickerBadge}>
                  <Text style={styles.tickerText}>{p.tickers || 'N/A'}</Text>
                </View>
                <View style={styles.algoBadge}>
                  <Text style={styles.algoText}>{p.algorithm?.toUpperCase() || 'GBM'}</Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Очікувана ціна</Text>
                  <Text style={styles.metricValue}>${formatMoney(p.expectedPrice)}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Дата створення</Text>
                  <Text style={styles.metricValue}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('uk-UA') : 'N/A'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 16 },
  backButton: { marginBottom: 15, alignSelf: 'flex-start' },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
  pageTitle: { color: '#FFF', fontSize: 26, fontWeight: 'bold', marginBottom: 25 },
  sectionLabel: { color: '#64748B', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
  
  portfolioCard: { 
    backgroundColor: '#1E293B', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#334155', 
    marginBottom: 12 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  tickerBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tickerText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 14 },
  algoBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  algoText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 12 },
  
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {},
  metricLabel: { color: '#64748B', fontSize: 12, marginBottom: 4 },
  metricValue: { color: '#F8FAFC', fontSize: 15, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155' },
  emptyStateText: { color: '#64748B', fontSize: 14, textAlign: 'center' }
});