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
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.modalOption, value === item.value && styles.modalOptionActive]}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, value === item.value && styles.modalOptionTextActive]}>
                    {item.label}
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

export default function ProSettings({ 
  algorithm, setAlgorithm, 
  lookback, setLookback, 
  horizon, setHorizon, 
  simulations, setSimulations 
}) {
  const ALGO_OPTIONS = [
    { label: 'Classic GBM Monte Carlo', value: 'gbm' },
    { label: 'Historical Simulation', value: 'historical' },
    { label: 'Merton Jump-Diffusion', value: 'merton' },
    { label: 'GARCH Volatility', value: 'garch' },
    { label: 'Stress Testing', value: 'stress' },
    { label: 'Backtesting (Test)', value: 'backtest' },
    { label: 'AI Forecast (LSTM)', value: 'lstm' },
    { label: 'Portfolio Optimization', value: 'markowitz' }
  ];

  const HISTORY_OPTIONS = [
    { label: '1 Рік', value: '1' },
    { label: '3 Роки', value: '3' },
    { label: '5 Років', value: '5' },
    { label: '10 Років', value: '10' }
  ];

  const selectedAlgoLabel = ALGO_OPTIONS.find(o => o.value === algorithm)?.label || algorithm;
  const selectedHistoryLabel = HISTORY_OPTIONS.find(o => o.value === lookback)?.label || lookback;

  return (
    <View style={styles.container}>
      <CustomDropdown 
        label="Тип алгоритму" 
        value={selectedAlgoLabel} 
        options={ALGO_OPTIONS} 
        onSelect={setAlgorithm} 
      />
      
      <CustomDropdown 
        label="Глибина історії" 
        value={selectedHistoryLabel} 
        options={HISTORY_OPTIONS} 
        onSelect={setLookback} 
      />

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Симуляцій</Text>
          <TextInput 
            style={styles.input} 
            value={String(simulations)} 
            onChangeText={setSimulations} 
            keyboardType="numeric" 
          />
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Горизонт (днів)</Text>
          <TextInput 
            style={styles.input} 
            value={String(horizon)} 
            onChangeText={setHorizon} 
            keyboardType="numeric" 
          />
        </View>
      </View>
    </View>
  );
}

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
  label: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  input: { backgroundColor: '#0B0F19', borderWidth: 1, borderColor: '#334155', borderRadius: 8, color: '#FFFFFF', paddingHorizontal: 12, height: 42, fontSize: 14 },
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
