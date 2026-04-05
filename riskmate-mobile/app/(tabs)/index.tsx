import React, { useEffect, useState } from 'react';import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  
  
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

// Мокові дані для карток (як на твоєму сайті)
const MARKET_DATA = [
  { id: '1', symbol: 'SPY', price: '655.83', change: '+0.09%', isUp: true },
  { id: '2', symbol: 'QQQ', price: '584.98', change: '+0.11%', isUp: true },
  { id: '3', symbol: 'GLD', price: '429.41', change: '-1.92%', isUp: false },
  { id: '4', symbol: 'BTC-USD', price: '66,872.67', change: '-0.02%', isUp: false },
  { id: '5', symbol: 'AAPL', price: '255.92', change: '+0.11%', isUp: true },
  { id: '6', symbol: 'MSFT', price: '373.46', change: '+1.11%', isUp: true },
  { id: '7', symbol: 'NVDA', price: '177.39', change: '+0.93%', isUp: true },
  { id: '8', symbol: 'GOOGL', price: '295.77', change: '-0.54%', isUp: false },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // "Слухаємо", чи залогінений користувач
  useEffect(() => {
    // Тепер auth береться з нашого конфігу
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleStartAnalysis = () => {
    if (user) {
      // Якщо юзер є — пускаємо в аналіз
      router.push('/analysis' as any); 
    } else {
      // Якщо немає — відправляємо на реєстрацію
      router.push('/register' as any); 
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- HERO СЕКЦІЯ (Як на сайті) --- */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>RiskMate</Text>
          <Text style={styles.heroSubtitle}>
            Професійний інструмент для прогнозування фінансових ризиків та аналізу портфелів.
          </Text>
          
<TouchableOpacity 
      style={styles.heroButton} 
      onPress={handleStartAnalysis}
    >
      <Text style={styles.heroButtonText}>Розпочати Аналіз Ризиків</Text>
    </TouchableOpacity>
        </View>

        {/* --- РОЗДІЛЮВАЧ --- */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>РИНОК У РЕАЛЬНОМУ ЧАСІ</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* --- СІТКА КАРТОК --- */}
        <View style={styles.grid}>
          {MARKET_DATA.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.7}>
              <View style={styles.cardHeader}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <View style={[styles.badge, item.isUp ? styles.badgeUp : styles.badgeDown]}>
                  <Text style={[styles.badgeText, item.isUp ? styles.textUp : styles.textDown]}>
                    {item.isUp ? '↗' : '↘'} {item.change}
                  </Text>
                </View>
              </View>
              <Text style={styles.price}>${item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- СТИЛІ ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 16, paddingTop: 30 },
  
  // Hero секція
  heroSection: { alignItems: 'center', marginBottom: 40, paddingHorizontal: 10 },
  heroTitle: { color: '#8B5CF6', fontSize: 36, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  heroSubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  heroButton: { backgroundColor: '#6366F1', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  heroButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Розділювач
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#334155' },
  dividerText: { color: '#64748B', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, paddingHorizontal: 15 },

  // Сітка карток
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { 
    width: (screenWidth - 32 - 12) / 2, // 2 колонки з відступами
    backgroundColor: '#1E293B', 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#334155', 
    marginBottom: 12 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  symbol: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  // Бейджі зміни ціни
  badge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.1)' },
  badgeUp: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgeDown: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  textUp: { color: '#10B981' },
  textDown: { color: '#EF4444' },
  
  price: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold' }
});