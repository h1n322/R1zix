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
import { Ionicons } from '@expo/vector-icons';

// Компонент одного пункту в списку (з іконкою галочки)
const FeatureItem = ({ text }) => (
  <View style={styles.featureItem}>
    <Ionicons name="checkmark-circle" size={18} color="#10B981" style={{ marginRight: 10 }} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

export default function PricingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>

        <View style={styles.headerCentered}>
          <Text style={styles.pageTitle}>Тарифи RiskMate</Text>
          <Text style={styles.subtitle}>
            Оберіть план, який найкраще підходить для ваших інвестиційних потреб.
          </Text>
        </View>

        {/* 1. BASIC ТАРИФ */}
        <View style={styles.card}>
          <Text style={styles.tierName}>Basic</Text>
          <Text style={styles.priceText}>$0 <Text style={styles.priceSub}>/ міс</Text></Text>
          <View style={styles.divider} />
          <FeatureItem text="До 10 симуляцій на день" />
          <FeatureItem text="Базові показники (VaR 95%)" />
          <FeatureItem text="Історичні дані (до 2 років)" />
          <FeatureItem text="Стандартний список акцій" />
          <TouchableOpacity style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Поточний план</Text>
          </TouchableOpacity>
        </View>

        {/* 2. PRO ТАРИФ (АКЦЕНТНИЙ) */}
        <View style={[styles.card, styles.cardPro]}>
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>НАЙПОПУЛЯРНІШИЙ</Text>
          </View>
          <Text style={styles.tierName}>Pro Analyst</Text>
          <Text style={[styles.priceText, { color: '#3B82F6' }]}>$15 <Text style={styles.priceSub}>/ міс</Text></Text>
          <View style={styles.divider} />
          <FeatureItem text="Безлімітні симуляції" />
          <FeatureItem text="Розширені метрики (CVaR, Sharpe)" />
          <FeatureItem text="Експорт звітів у PDF та CSV" />
          <FeatureItem text="Історичні дані до 10 років" />
          <TouchableOpacity style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Оформити підписку</Text>
          </TouchableOpacity>
        </View>

        {/* 3. ENTERPRISE ТАРИФ */}
        <View style={styles.card}>
          <Text style={styles.tierName}>Enterprise</Text>
          <Text style={styles.priceText}>Custom</Text>
          <View style={styles.divider} />
          <FeatureItem text="Прогнозування через AI (LSTM)" />
          <FeatureItem text="Доступ до RiskMate API" />
          <FeatureItem text="Інтеграція з вашим брокером" />
          <FeatureItem text="Окрема хмарна інфраструктура" />
          <TouchableOpacity style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Зв'язатися з нами</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 6 },
  
  headerCentered: { alignItems: 'center', marginBottom: 30 },
  pageTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },

  // Картки
  card: { backgroundColor: '#1E293B', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155', marginBottom: 20 },
  cardPro: { borderColor: '#3B82F6', borderWidth: 2, backgroundColor: '#162032', marginTop: 15 },
  
  badgeWrapper: { position: 'absolute', top: -12, alignSelf: 'center', backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },

  tierName: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  priceText: { color: '#FFF', fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
  priceSub: { fontSize: 16, color: '#64748B', fontWeight: 'normal' },
  
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 20 },
  
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  featureText: { color: '#CBD5E1', fontSize: 14, flex: 1 },

  // Кнопки
  btnPrimary: { backgroundColor: '#3B82F6', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  btnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#475569', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnSecondaryText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' }
});