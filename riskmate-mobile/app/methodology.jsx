import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MethodologyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Наукова методологія</Text>
        <Text style={styles.subtitle}>
          Rizix використовує передові математичні моделі та алгоритми штучного інтелекту.
        </Text>

        {/* Секція 1: Монте-Карло */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>1. Метод Монте-Карло</Text>
          </View>
          <Text style={styles.sectionText}>
            Клас обчислювальних алгоритмів, що спираються на багаторазове випадкове моделювання. Rizix генерує тисячі можливих траєкторій ціни активу, що дозволяє побачити не лише середній результат, але й спектр найгірших сценаріїв.
          </Text>
        </View>

        {/* Секція 2: GBM */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>2. Броунівський рух (GBM)</Text>
          </View>
          <Text style={styles.sectionText}>
            Для генерації кожного кроку використовується стохастичне диференціальне рівняння GBM. Модель припускає, що дохідність активу має нормальний розподіл.
          </Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>S(t) = S(t-1) * exp[ (μ - σ²/2)Δt + σ * ε * √(Δt) ]</Text>
          </View>
        </View>

        {/* Секція 3: VaR та CVaR */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>3. Ризики (VaR та CVaR)</Text>
          </View>
          <Text style={styles.sectionText}>
            <Text style={{fontWeight: 'bold', color: '#E2E8F0'}}>VaR</Text> показує максимальний очікуваний збиток із заданим рівнем довіри (наприклад, 95%). {'\n\n'}
            <Text style={{fontWeight: 'bold', color: '#E2E8F0'}}>CVaR (Expected Shortfall)</Text> розраховує середній збиток у тих 5% найгірших випадків. Це більш надійна метрика за стандартом Basel III.
          </Text>
        </View>

        {/* Секція 4: AI */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hardware-chip-outline" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>4. Штучний Інтелект (LSTM)</Text>
          </View>
          <Text style={styles.sectionText}>
            На додаток до класики, ми впроваджуємо нейронні мережі Long Short-Term Memory (LSTM) для аналізу часових рядів. Вони здатні запам'ятовувати довгострокові залежності та виявляти нелінійні патерни ринку.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 6 },
  
  pageTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#94A3B8', fontSize: 14, lineHeight: 22, marginBottom: 25 },

  sectionCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  sectionText: { color: '#CBD5E1', fontSize: 14, lineHeight: 22 },
  
  formulaBox: { backgroundColor: '#0F172A', padding: 12, borderRadius: 8, marginTop: 15, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  formulaText: { color: '#10B981', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, textAlign: 'center' }
});