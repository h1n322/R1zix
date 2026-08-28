import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// 👇 ДОДАЄМО FIREBASE
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase'; // Переконайся, що шлях правильний (якщо файл в app, то '../firebase')

import ProSettings from '../../components/ProSettings';
import KpiCards from '../../components/KpiCards';
import MobileChart from '../../components/MobileChart';

// Вмикаємо анімацію LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = 'https://rizix-ai.onrender.com/api/simulate';

// --- ОТРИМУЄМО РОЗМІРИ ЕКРАНА ---
const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375; // Перевірка для маленьких екранів (як Mini)

export default function AnalysisScreen() {
  const router = useRouter();

  // --- СТЕЙТИ КОРИСТУВАЧА ---
  const [userName, setUserName] = useState('Гість');
  const [userInitial, setUserInitial] = useState('?');

  const [ticker, setTicker] = useState('AAPL');
  const [metrics, setMetrics] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(false);

  // --- СТЕЙТИ НАЛАШТУВАНЬ ---
  const [showSettings, setShowSettings] = useState(false);
  const [algorithm, setAlgorithm] = useState('gbm');
  const [lookback, setLookback] = useState('5');
  const [horizon, setHorizon] = useState('30');
  const [simulations, setSimulations] = useState('1000');

  // 👇 СЛУХАЄМО FIREBASE (щоб бейдж оновлювався)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split('@')[0] || 'Користувач';
        setUserName(name);
        setUserInitial(name.charAt(0).toUpperCase());
      } else {
        setUserName('Гість');
        setUserInitial('?');
      }
    });
    return unsubscribe;
  }, []);

  const toggleSettings = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSettings(!showSettings);
  };

const handleAnalyze = async () => {
    if (!ticker.trim()) {
      Alert.alert("Помилка", "Будь ласка, введіть тикер активу");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: ticker,
          algorithm: algorithm,
          lookback_years: Number(lookback),
          horizon: Number(horizon),
          simulations: Number(simulations),
          var_confidence: 0.95,
          risk_free_rate: 0.045
        })
      });

      if (!response.ok) {
        throw new Error(`Помилка сервера: ${response.status}`);
      }

      const data = await response.json();
      
      // 👇 1. ВИВОДИМО ДАНІ В КОНСОЛЬ, ЩОБ БАЧИТИ ПРАВДУ
      console.log("🔥 ДАНІ ВІД PYTHON:", data);

      // 👇 2. ПЕРЕВІРКА: ЧИ ОНОВИВСЯ БЕКЕНД?
      if (data.var_5 === undefined || !data.stock_info) {
        console.warn("⚠️ УВАГА: Бекенд віддає старий формат даних! Firebase збереження скасовано.");
        Alert.alert(
          "Старі дані від сервера", 
          "Бекенд повернув дані без нових метрик. Переконайся, що ти зберіг файли Python і перезапустив сервер!"
        );
      }

      setMetrics(data); // Малюємо графіки на екрані

      // ==========================================
      // 👇 МАГІЯ ЗБЕРЕЖЕННЯ В FIREBASE
      // Зберігаємо ТІЛЬКИ якщо користувач залогінений І бекенд прислав правильні дані
      if (auth.currentUser && data.var_5 !== undefined) {
        try {
          const today = new Date();
          const dateString = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;

          await addDoc(collection(db, 'simulations'), {
            userId: auth.currentUser.uid, 
            ticker: ticker.toUpperCase(),
            // Використовуємо фолбеки (|| 0), щоб точно уникнути помилок Firebase
            expected_price: data.expected_price || 0,
            var_5: data.var_5 || 0,
            dateStr: dateString,
            timestamp: serverTimestamp() 
          });
          console.log("✅ Успішно збережено в хмару Firebase!");
          
        } catch (dbError) {
          console.error("🚨 Помилка запису в Firebase:", dbError);
        }
      }
      // ==========================================

      if (showSettings) {
        toggleSettings();
      }

    } catch (error) {
      console.error("🚨 Помилка fetch:", error);
      Alert.alert("Помилка з'єднання", "Не вдалося достукатися до бекенду.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Rizix</Text>
          
          <TouchableOpacity 
            style={styles.userBadge} 
            onPress={() => router.push('/profile' as any)}
          >
            <View style={styles.avatarCircle}>
              {/* 👇 ПІДСТАВЛЯЄМО ДИНАМІЧНУ ЛІТЕРУ */}
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            {/* 👇 ПІДСТАВЛЯЄМО ДИНАМІЧНЕ ІМ'Я */}
            <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
          </TouchableOpacity>
        </View>

        {/* --- ПОШУК ТИКЕРА --- */}
        <View style={styles.searchSection}>
          
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}
            onPress={() => router.push('/portfolio' as any)}
          >
            <Ionicons name="briefcase-outline" size={16} color="#3B82F6" />
            <Text style={{ color: '#3B82F6', fontSize: 13, fontWeight: 'bold' }}>Мій портфель</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input}
              value={ticker}
              onChangeText={text => setTicker(text.toUpperCase())}
              placeholder="AAPL..."
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={[
                styles.runButton, 
                isLoading && { opacity: 0.7 },
                isSmallScreen && { minWidth: 70, height: 45 } 
              ]} 
              onPress={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.runButtonText}>Аналіз</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleSettings}>
            <Ionicons name="settings-outline" size={16} color="#3B82F6" style={{ marginRight: 6 }} />
            <Text style={styles.toggleButtonText}>Налаштування</Text>
            <Ionicons 
              name={showSettings ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#3B82F6" 
              style={{ marginLeft: 4 }} 
            />
          </TouchableOpacity>

          {showSettings && (
            <ProSettings algorithm={algorithm} setAlgorithm={setAlgorithm} lookback={lookback} setLookback={setLookback} horizon={horizon} setHorizon={setHorizon} simulations={simulations} setSimulations={setSimulations} />
          )}
        </View>

        {/* --- KPI КАРТКИ --- */}
        <KpiCards metrics={metrics} varConf={0.95} />

        {/* --- ГРАФІК --- */}
        <MobileChart data={metrics?.chart_data} />
{/* 👇 ПОКАЗУЄМО ЦІ БЛОКИ ТІЛЬКИ ЯКЩО Є ДАНІ ВІД API 👇 */}
        {metrics && (
          <>
            {/* 1. БЛОК ДЕТАЛЕЙ (МЕТРИКИ) */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsGrid}>
                {/* Беремо масив stock_info з бекенду */}
                {(metrics.stock_info || []).map((item: any, index: number) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={styles.detailValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* 2. БЛОК НОВИН */}
            <View style={styles.newsCard}>
              <Text style={styles.newsTitle}>ОСТАННІ НОВИНИ</Text>
              {/* Якщо бекенд поверне новини — покажемо їх, якщо ні — заглушку */}
              {metrics.news && metrics.news.length > 0 ? (
                metrics.news.map((newsItem: any, idx: number) => (
                  <Text key={idx} style={{color: '#F8FAFC', marginBottom: 5, fontSize: 13}}>
                    • {newsItem.title}
                  </Text>
                ))
              ) : (
                <Text style={styles.newsEmptyText}>Новин для цього активу тимчасово немає...</Text>
              )}
            </View>

            {/* 3. ГРАФІК РОЗПОДІЛУ ЙМОВІРНОСТЕЙ */}
            <View style={styles.distributionCard}>
              <Text style={styles.distributionTitle}>РОЗПОДІЛ ЙМОВІРНОСТЕЙ (ДЗВІН МОНТЕ-КАРЛО)</Text>
              
              <View style={styles.histogramContainer}>
                {/* Беремо дані для гістограми з бекенду */}
                {(metrics.histogram || []).map((bar: any, index: number) => (
                  <View 
                    key={index} 
                    style={[
                      styles.bar, 
                      { 
                        height: `${bar.h}%`, 
                        backgroundColor: bar.type === 'red' ? '#EF4444' : '#10B981' 
                      }
                    ]} 
                  />
                ))}
              </View>
              
              <View style={styles.legendContainer}>
                <View style={styles.legendDotRed} />
                <Text style={styles.legendText}>Червона зона — ризик</Text>
                <View style={[styles.legendDotRed, { backgroundColor: '#10B981', marginLeft: 15 }]} />
                <Text style={styles.legendText}>Зелена зона — прибуток</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- СТИЛІ ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 16 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    marginTop: isSmallScreen ? 5 : 10, 
  },
  logoText: { 
    color: '#FFFFFF', 
    fontSize: isSmallScreen ? 24 : 28, 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  },
  
  userBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(30, 41, 59, 0.5)', 
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  avatarCircle: { 
    width: 22, height: 22, borderRadius: 11, 
    backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginRight: 8 
  },
  avatarText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  userName: { color: '#E2E8F0', fontSize: isSmallScreen ? 13 : 14, fontWeight: '600', maxWidth: isSmallScreen ? 70 : 100 },
  
  searchSection: { marginBottom: 25 },
  label: { color: '#94A3B8', fontSize: 13, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 12, color: '#FFFFFF', paddingHorizontal: 16, height: 50, fontSize: 16 },
  
  runButton: { backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, borderRadius: 12, height: 50, minWidth: 90 },
  runButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  
  toggleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  toggleButtonText: { color: '#3B82F6', fontSize: 14, fontWeight: '600' },
  
  settingsPanel: { backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginTop: 15 },
  halfWidth: { flex: 1 },
  inputSmall: { backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#334155', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 12, height: 40, fontSize: 14 },
  
  segmentGroup: { flexDirection: 'row', backgroundColor: '#0B0F19', borderRadius: 8, padding: 4, borderWidth: 1, borderColor: '#334155' },
  segmentBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 }, 
  segmentBtnActive: { backgroundColor: '#3B82F6' },
  segmentText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  segmentTextActive: { color: '#FFFFFF' },


  // Блок деталей (метрики)
  detailsCard: { backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', padding: 16, marginTop: 20 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailItem: { width: '48%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(51, 65, 85, 0.5)', paddingBottom: 6 },
  detailLabel: { color: '#64748B', fontSize: 12 },
  detailValue: { color: '#F8FAFC', fontSize: 13, fontWeight: 'bold' },

  // Блок новин
  newsCard: { backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', padding: 20, marginTop: 15 },
  newsTitle: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10, textAlign: 'center' },
  newsEmptyText: { color: '#64748B', fontSize: 13, fontStyle: 'italic', textAlign: 'center' },

  // Дзвін Монте-Карло (Розподіл ймовірностей)
  distributionCard: { backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', padding: 16, marginTop: 15, marginBottom: 30 },
  distributionTitle: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'center', marginBottom: 20 },
  histogramContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, paddingHorizontal: 5 },
  bar: { flex: 1, marginHorizontal: 1, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  legendDotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 6 },
  legendText: { color: '#64748B', fontSize: 11 }






});