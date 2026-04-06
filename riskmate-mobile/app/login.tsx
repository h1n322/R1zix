import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Шлях до твого конфігу

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Помилка", "Заповніть пошту та пароль");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/' as any); // Після входу — на головну
    } catch (error: any) {
      Alert.alert("Помилка входу", "Невірна пошта або пароль");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={60} color="#3B82F6" />
            <Text style={styles.logo}>RiskMate</Text>
            <Text style={styles.subtitle}>Вхід у систему аналітики</Text>
          </View>

          {/* Електронна пошта */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Електронна пошта</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="max@example.com"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Пароль */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Пароль</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Увійти</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ще немає акаунта? </Text>
            <TouchableOpacity onPress={() => router.push('/register' as any)}>
              <Text style={styles.link}>Створити зараз</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  keyboardView: { flex: 1 },
  formContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  subtitle: { color: '#94A3B8', fontSize: 14, marginTop: 5 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  loginButton: {
    backgroundColor: '#3B82F6',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: '#94A3B8', fontSize: 14 },
  link: { color: '#3B82F6', fontSize: 14, fontWeight: 'bold' }
});