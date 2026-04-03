import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

export default function PortfolioScreen() {
  const router = useRouter();
  
  // Початковий список тикерів (як на твоєму скріншоті)
  const [tickers, setTickers] = useState(['KO', 'AAPL']);
  const [newTicker, setNewTicker] = useState('');

  // Функція додавання
  const handleAddTicker = () => {
    const trimmed = newTicker.trim().toUpperCase();
    if (trimmed && !tickers.includes(trimmed)) {
      setTickers([trimmed, ...tickers]); // Додаємо на початок списку
      setNewTicker(''); // Очищаємо поле
    }
  };

  // Функція видалення
  const handleRemoveTicker = (tickerToRemove: string) => {
    setTickers(tickers.filter(t => t !== tickerToRemove));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Кнопка "Назад" */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Мій портфель</Text>

          {/* Блок додавання тикера */}
          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              placeholder="Напр. TSLA"
              placeholderTextColor="#64748B"
              autoCapitalize="characters"
              value={newTicker}
              onChangeText={setNewTicker}
            />
            <TouchableOpacity 
              style={[styles.addButton, !newTicker.trim() && { opacity: 0.5 }]} 
              onPress={handleAddTicker}
              disabled={!newTicker.trim()}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>ЗБЕРЕЖЕНІ АКТИВИ</Text>

          {/* Список тикерів */}
          {tickers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Ваш портфель порожній.</Text>
            </View>
          ) : (
            tickers.map((ticker, index) => (
              <View key={index} style={styles.tickerCard}>
                <View style={styles.tickerInfo}>
                  <View style={styles.iconPlaceholder}>
                    <Text style={styles.iconText}>{ticker.charAt(0)}</Text>
                  </View>
                  <Text style={styles.tickerName}>{ticker}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleRemoveTicker(ticker)}
                >
                  <Text style={styles.deleteText}>Видалити</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- СТИЛІ АДАПТОВАНІ ПІД MINI ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 16 },
  backButton: { marginBottom: 15, alignSelf: 'flex-start' },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600' },
  pageTitle: { color: '#FFF', fontSize: 26, fontWeight: 'bold', marginBottom: 25 },
  
  // Додавання
  addSection: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  input: { flex: 1, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', borderRadius: 12, color: '#FFFFFF', paddingHorizontal: 16, height: 50, fontSize: 16 },
  addButton: { backgroundColor: '#3B82F6', width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },

  sectionLabel: { color: '#64748B', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },

  // Картка тикера
  tickerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1E293B', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginBottom: 10 },
  tickerInfo: { flexDirection: 'row', alignItems: 'center' },
  iconPlaceholder: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(59, 130, 246, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconText: { color: '#3B82F6', fontWeight: 'bold', fontSize: 16 },
  tickerName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  
  deleteButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  deleteText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155' },
  emptyStateText: { color: '#64748B', fontSize: 14 }
});