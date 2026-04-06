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

// 👇 ДОДАЄМО FIREBASE
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase'; // Переконайся, що шлях правильний (якщо файл в app, то '../firebase')

import ProSettings from '../../components/ProSettings';
import KpiCards from '../../components/KpiCards';
import MobileChart from '../../components/MobileChart';

// Вмикаємо анімацію LayoutAnimation для Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_URL = 'http://127.0.0.1:8000/api/simulate';

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
          risk_free_rate: 4.5
        })
      });

      if (!response.ok) {
        throw new Error(`Помилка сервера: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);

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
          <Text style={styles.logoText}>RiskMate</Text>
          
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
            <ProSettings />
          )}
        </View>

        {/* --- KPI КАРТКИ --- */}
        <KpiCards metrics={metrics} varConf={0.95} />

        {/* --- ГРАФІК --- */}
        <MobileChart data={metrics?.chart_data} />

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
  segmentTextActive: { color: '#FFFFFF' }
});