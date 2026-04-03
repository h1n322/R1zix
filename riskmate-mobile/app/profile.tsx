import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';

// Тимчасові дані (імітуємо твою базу даних з веб-версії)
const MOCK_HISTORY = [
  { id: '1', ticker: 'AAPL', date: '13.03.2026', expected: 261.82, risk: 30.84 },
  { id: '2', ticker: 'NVDA,AAPL...', date: '13.03.2026', expected: 181.05, risk: 36.86 },
  { id: '3', ticker: 'AAPL', date: '12.03.2026', expected: 267.20, risk: 33.33 },
  { id: '4', ticker: 'TSLA,KO...', date: '11.03.2026', expected: 1900.51, risk: 217.88 },
  { id: '5', ticker: 'AAPLE', date: '11.03.2026', expected: 1901.93, risk: 144.03 },
  { id: '6', ticker: 'KO,AAPL...', date: '09.03.2026', expected: 105.40, risk: 12.50 },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Кнопка "Назад" */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← У Дашборд</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Мій профіль</Text>

        {/* Картка користувача */}
        <View style={styles.userCard}>
          <View style={styles.userInfoWrapper}>
            <View style={styles.bigAvatar}>
              <Text style={styles.bigAvatarText}>МТ</Text>
            </View>
            <View>
              <Text style={styles.userName}>Максим Тыванюк</Text>
              <Text style={styles.userEmail}>Інвестор RiskMate</Text>
              <Text style={styles.userEmailSub}>tyvanukmax@gmail.com</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/register' as any)}>
            <Text style={styles.logoutText}>Вийти з акаунту</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Історія збережених симуляцій</Text>

        {/* Сітка карток історії */}
        <View style={styles.historyGrid}>
          {MOCK_HISTORY.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <View style={styles.tickerBadge}>
                  <Text style={styles.tickerText} numberOfLines={1}>{item.ticker}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <View style={styles.metricsRow}>
                <View>
                  <Text style={styles.metricLabel}>Очікувана ціна:</Text>
                  <Text style={styles.metricValue}>${item.expected.toFixed(2)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.metricLabel}>VaR (Ризик):</Text>
                  <Text style={styles.riskValue}>${item.risk.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20 },
  backButton: { marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
  pageTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  
  userCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 35 },
  userInfoWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  bigAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  bigAvatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { color: '#94A3B8', fontSize: 14 },
  userEmailSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  logoutButton: { borderColor: '#EF4444', borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },

  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  
  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  historyCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tickerBadge: { backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, maxWidth: '55%' },
  tickerText: { color: '#3B82F6', fontSize: 10, fontWeight: 'bold' },
  dateText: { color: '#64748B', fontSize: 10 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { color: '#94A3B8', fontSize: 10, marginBottom: 4 },
  metricValue: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  riskValue: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' }
});