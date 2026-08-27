import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Переконайся, що шлях до firebase правильний

// Тимчасові дані історії
const MOCK_HISTORY = [
  { id: '1', ticker: 'AAPL', date: '13.03.2026', expected: 261.82, risk: 30.84 },
  { id: '2', ticker: 'NVDA,AAPL...', date: '13.03.2026', expected: 181.05, risk: 36.86 },
  { id: '3', ticker: 'AAPL', date: '12.03.2026', expected: 267.20, risk: 33.33 },
  { id: '4', ticker: 'TSLA,KO...', date: '11.03.2026', expected: 1900.51, risk: 217.88 },
];

export default function ProfileScreen() {
  const router = useRouter();

  // Стани для користувача
  const [userName, setUserName] = useState('Завантаження...');
  const [userEmail, setUserEmail] = useState('');
  const [userInitial, setUserInitial] = useState('');

  // Слухаємо стан авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split('@')[0] || 'Користувач';
        setUserName(name);
        setUserEmail(user.email || '');
        setUserInitial(name.charAt(0).toUpperCase());
      } else {
        // Якщо не авторизований, можемо показати заглушку або відправити на логін
        setUserName('Гість');
        setUserEmail('Немає пошти');
        setUserInitial('?');
      }
    });

    return unsubscribe;
  }, []);

  // Логіка виходу
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login' as any);
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Кнопка "Назад" */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← У Дашборд</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Мій профіль</Text>

        {/* --- КАРТКА КОРИСТУВАЧА --- */}
        <View style={styles.userCard}>
          <View style={styles.userInfoWrapper}>
            <View style={styles.bigAvatar}>
              <Text style={styles.bigAvatarText}>{userInitial}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>Інвестор Rizix</Text>
              <Text style={styles.userEmailSub}>{userEmail}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Вийти з акаунту</Text>
          </TouchableOpacity>
        </View>

        {/* --- НОВЕ МЕНЮ ІНФОРМАЦІЇ --- */}
        <Text style={styles.sectionTitle}>Корисна інформація</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/guide' as any)}>
            <Ionicons name="book-outline" size={22} color="#3B82F6" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Довідник інвестора</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/about' as any)}>
            <Ionicons name="information-circle-outline" size={22} color="#F59E0B" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Про проєкт</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/methodology' as any)}>
            <Ionicons name="flask-outline" size={22} color="#10B981" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Наукова методологія</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/pricing' as any)}>
            <Ionicons name="diamond-outline" size={22} color="#8B5CF6" style={styles.menuItemIcon} />
            <Text style={styles.menuItemText}>Тарифи (PRO)</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* --- ІСТОРІЯ СИМУЛЯЦІЙ --- */}
        <Text style={styles.sectionTitle}>Історія збережених симуляцій</Text>
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
                <View style={styles.riskColumn}>
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
  
  userCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 25 },
  userInfoWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  bigAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  bigAvatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  userRole: { color: '#94A3B8', fontSize: 14 },
  userEmailSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  logoutButton: { borderColor: '#EF4444', borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },

  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15, paddingLeft: 5 },
  
  menuContainer: { backgroundColor: '#1E293B', borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 35, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#334155' },
  menuItemIcon: { marginRight: 15 },
  menuItemText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600', flex: 1 },
  
  historyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  historyCard: { width: '48%', backgroundColor: '#1E293B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tickerBadge: { backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, maxWidth: '55%' },
  tickerText: { color: '#3B82F6', fontSize: 10, fontWeight: 'bold' },
  dateText: { color: '#64748B', fontSize: 10 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { color: '#94A3B8', fontSize: 10, marginBottom: 4 },
  metricValue: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  riskColumn: { alignItems: 'flex-end' },
  riskValue: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' }
});