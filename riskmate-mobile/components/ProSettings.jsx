import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  Dimensions
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

// --- КАСТОМНИЙ КОМПОНЕНТ ВИПАДАЮЧОГО СПИСКУ ---
const CustomDropdown = ({ label, value, options, onSelect }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.dropdownButton} 
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalOption, value === item && styles.modalOptionActive]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, value === item && styles.modalOptionTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ НАЛАШТУВАНЬ ---
export default function ProSettings() {
  const [algo, setAlgo] = useState('Classic GBM Monte Carlo');
  const [history, setHistory] = useState('5 Років');
  const [confidence, setConfidence] = useState('95% (Стандарт)');
  
  const [simulations, setSimulations] = useState('1000');
  const [horizon, setHorizon] = useState('30');
  const [riskFree, setRiskFree] = useState('4,5');

  const ALGO_OPTIONS = [
    'Classic GBM Monte Carlo',
    'Historical Simulation',
    'Merton Jump-Diffusion',
    'GARCH Volatility',
    'Stress Testing',
    'Backtesting (Test)',
    'AI Forecast (LSTM)',
    'Portfolio Optimization'
  ];

  return (
    <View style={styles.container}>
      
      {/* Кнопки Зберегти / Завантажити */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.actionButton, styles.blueButton]}>
          <Text style={styles.actionButtonText}>💾 Зберегти</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.blueButton]}>
          <Text style={styles.actionButtonText}>📂 Завантажити</Text>
        </TouchableOpacity>
      </View>

      {/* Випадаючі списки */}
      <CustomDropdown 
        label="Тип алгоритму" 
        value={algo} 
        options={ALGO_OPTIONS} 
        onSelect={setAlgo} 
      />
      
      <CustomDropdown 
        label="Глибина історії" 
        value={history} 
        options={['1 Рік', '3 Роки', '5 Років', '10 Років']} 
        onSelect={setHistory} 
      />

      <CustomDropdown 
        label="Рівень довіри (VaR)" 
        value={confidence} 
        options={['90%', '95% (Стандарт)', '99% (Суворий)']} 
        onSelect={setConfidence} 
      />

      {/* Числові інпути (Симуляції та Горизонт) */}
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Симуляцій</Text>
          <TextInput 
            style={styles.input} 
            value={simulations} 
            onChangeText={setSimulations} 
            keyboardType="numeric" 
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Горизонт</Text>
          <TextInput 
            style={styles.input} 
            value={horizon} 
            onChangeText={setHorizon} 
            keyboardType="numeric" 
          />
        </View>
      </View>

      {/* Безризикова ставка */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Безризикова ставка (%)</Text>
        <TextInput 
          style={styles.input} 
          value={riskFree} 
          onChangeText={setRiskFree} 
          keyboardType="numeric" 
        />
      </View>

      {/* Кнопки експорту */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.actionButton, styles.purpleButton]}>
          <Text style={styles.actionButtonText}>📄 PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.purpleButton]}>
          <Text style={styles.actionButtonText}>📊 CSV</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// --- СТИЛІ ---
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    padding: isSmallScreen ? 12 : 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  halfWidth: { flex: 1 },
  inputGroup: { marginBottom: 15 },
  
  label: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  
  input: { backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#334155', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 12, height: 42, fontSize: 14 },
  
  // Кнопки дій
  actionButton: { flex: 1, height: 42, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  blueButton: { backgroundColor: '#4F46E5' }, // Індиго колір як на сайті
  purpleButton: { backgroundColor: '#6366F1' }, 
  actionButtonText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

  // Головна кнопка
  runProButton: { backgroundColor: '#8B5CF6', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  runProButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  // Стилі Dropdown
  dropdownContainer: { marginBottom: 15 },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#334155', borderRadius: 8, paddingHorizontal: 12, height: 42 },
  dropdownButtonText: { color: '#FFF', fontSize: 13 },
  dropdownArrow: { color: '#64748B', fontSize: 10 },
  
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 12, borderWidth: 1, borderColor: '#334155', maxHeight: 300, overflow: 'hidden' },
  modalOption: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
  modalOptionActive: { backgroundColor: '#3B82F6' },
  modalOptionText: { color: '#E2E8F0', fontSize: 14 },
  modalOptionTextActive: { color: '#FFF', fontWeight: 'bold' }
});