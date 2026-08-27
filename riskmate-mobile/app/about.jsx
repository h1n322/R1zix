import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#3B82F6" />
          <Text style={styles.backButtonText}>Назад</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Про проєкт</Text>

        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={50} color="#3B82F6" />
            <Text style={styles.brandName}>Rizix</Text>
          </View>

          <Text style={styles.description}>
            Rizix — це інноваційний науково-дослідницький проєкт, створений для участі у конкурсі-захисті Малої академії наук України (МАН). 
          </Text>
          
          <Text style={styles.description}>
            Головна мета платформи — демократизувати доступ до складних інструментів фінансової аналітики. Ми поєднали класичні математичні моделі з сучасними алгоритмами, загорнувши це у швидкий, безпечний та інтуїтивно зрозумілий інтерфейс.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.authorTitle}>Команда проєкту:</Text>
          
          <View style={styles.authorsContainer}>
            {/* Твоя картка */}
            <View style={styles.personCard}>
              <View style={[styles.authorAvatar, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.authorAvatarText}>М</Text>
              </View>
              <View style={styles.authorTextContainer}>
                <Text style={styles.authorName}>Тиванюк Максим Вікторович</Text>
                <Text style={styles.authorRole}>Автор ідеї</Text>
              </View>
            </View>

            {/* Картка керівника */}
            <View style={styles.personCard}>
              <View style={[styles.authorAvatar, { backgroundColor: '#10B981' }]}>
                <Text style={styles.authorAvatarText}>НК</Text>
              </View>
              <View style={styles.authorTextContainer}>
                <Text style={styles.authorName}>Кривко Наталія Валерівна</Text>
                <Text style={styles.authorRole}>Науковий керівник</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.footerText}>Rizix © 2026. Всі права захищено.</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
  backButtonText: { color: '#3B82F6', fontSize: 16, fontWeight: '600', marginLeft: 6 },
  
  pageTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },

  card: { backgroundColor: '#1E293B', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  brandName: { color: '#F8FAFC', fontSize: 24, fontWeight: 'bold', marginTop: 10, letterSpacing: 1 },
  
  description: { color: '#CBD5E1', fontSize: 15, lineHeight: 24, marginBottom: 15, textAlign: 'justify' },
  
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 20 },
  
  authorTitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', marginBottom: 15 },
  
  authorsContainer: { gap: 15 }, // Робить гарний відступ між двома картками
  
  personCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', // Трохи темніший фон для міні-картки
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  
  authorAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  authorAvatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  
  authorTextContainer: { flex: 1 }, // Дозволяє довгому тексту переноситися, а не вилазити за екран
  authorName: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold' },
  authorRole: { color: '#3B82F6', fontSize: 13, marginTop: 4 },
  footerText: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 30 }
});