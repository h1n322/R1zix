import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({ title, content, isOpen, onPress }: any) => {
  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        style={[styles.accordionHeader, isOpen && styles.accordionHeaderOpen]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color="#3B82F6" 
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} 
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

export default function GuideScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number>(0);

  const faqs = [
    { title: "Що таке Value at Risk (VaR)?", content: "VaR (Вартість під ризиком) — це статистична метрика, яка показує максимально можливий збиток активу за певний період часу із заданим рівнем довіри. Це стандартна метрика в банківській сфері." },
    { title: "Що таке Conditional VaR (CVaR)?", content: "CVaR (Expected Shortfall) — це метрика для екстремальних ситуацій. Вона розраховує середній розмір збитку в тих 5% найгірших випадків, коли ринок пробиває ваш VaR." },
    { title: "Що таке Волатильність?", content: "Волатильність — це статистична міра розкиду доходності для даного цінного паперу. У Rizix ми використовуємо історичну волатильність для налаштування симуляцій Монте-Карло." },
    { title: "Як розуміти Коефіцієнт Шарпа?", content: "Показує, наскільки дохідність активу компенсує прийнятий ризик. Значення вище 1.0 вважається хорошим, вище 2.0 — чудовим." },
    { title: "Чому Монте-Карло краще?", content: "Традиційні прогнози малюють лише одну лінію. Симуляція Монте-Карло генерує тисячі можливих сценаріїв розвитку подій, враховуючи випадковість ринку, що дозволяє побачити розподіл ризиків." }
  ];

  const handleToggle = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Довідник інвестора</Text>
        <Text style={styles.subtitle}>Фінанси не повинні бути складними. Ми пояснюємо основні терміни Rizix.</Text>

        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} title={faq.title} content={faq.content}
              isOpen={openIndex === index} onPress={() => handleToggle(index)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 6 },
  pageTitle: { color: '#10B981', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#94A3B8', fontSize: 15, lineHeight: 22, marginBottom: 30 },
  faqList: { paddingBottom: 30 },
  accordionContainer: { marginBottom: 15, borderRadius: 12, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', padding: 18 },
  accordionHeaderOpen: { backgroundColor: '#1E293B' },
  accordionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', flex: 1, paddingRight: 10 },
  accordionContent: { backgroundColor: '#1E293B', padding: 18, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#334155' },
  accordionText: { color: '#CBD5E1', fontSize: 14, lineHeight: 22, marginTop: 15 }
});