import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

// Мокові дані для карток


export default function ExploreScreen() {
  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://rizix-api.onrender.com/api/market-overview')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item, index) => ({
          id: String(index),
          symbol: item.ticker,
          price: item.price,
          change: item.change,
          isUp: item.isUp
        }));
        setMarketData(formatted);
      })
      .catch(err => console.error("Error fetching market data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Додаємо стани для бейджа
  const [userName, setUserName] = useState('Гість');
  const [userInitial, setUserInitial] = useState('?');

  // "Слухаємо", чи залогінений користувач
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      
      // Логіка для бейджа:
      if (currentUser) {
        // Якщо є ім'я - беремо його, якщо ні - беремо текст до @ з пошти
        const nameToDisplay = currentUser.displayName || currentUser.email?.split('@')[0] || 'Користувач';
        setUserName(nameToDisplay);
        setUserInitial(nameToDisplay.charAt(0).toUpperCase()); // Перша літера велика
      } else {
        setUserName('Гість');
        setUserInitial('?');
      }
    });
    return unsubscribe;
  }, []);

  const handleStartAnalysis = () => {
    if (user) {
      router.push('/analysis' as any); 
    } else {
      router.push('/register' as any); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      {/* --- ХЕДЕР З БЕЙДЖЕМ --- */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }} />
        
        <TouchableOpacity 
          style={styles.badgeContainer}
          onPress={() => {
            if (user) {
              // Якщо користувач авторизований — йдемо в профіль
              router.push('/profile' as any);
            } else {
              // Якщо це гість — відправляємо на вхід
              router.push('/login' as any);
            }
          }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <Text style={styles.nameText}>{userName}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- HERO СЕКЦІЯ --- */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Rizix</Text>
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
          {marketData.map((item) => (
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
  
  // Стилі для хедера та бейджа
  topHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 5 },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 6, paddingRight: 14, borderRadius: 25, borderWidth: 1, borderColor: '#334155' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  avatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  nameText: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 14 },

  scrollContent: { padding: 16, paddingTop: 10 },
  
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
    width: (screenWidth - 32 - 12) / 2, 
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