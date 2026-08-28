import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase'; // Твій конфіг, який ми створили
import { Alert } from 'react-native';



export default function RegisterScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert("Помилка", "Будь ласка, заповніть усі поля");
      return;
    }

    try {
      // Створюємо користувача в Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Додаємо ім'я користувача в його профіль Firebase
      await updateProfile(userCredential.user, {
        displayName: name
      });

      console.log("Користувач зареєстрований:", userCredential.user.email);
      
      // Перекидаємо на головну (index тепер наш Explore/Market)
      router.replace('/' as any); 
    } catch (error: any) {
      console.error(error);
      let message = "Не вдалося зареєструватися";
      if (error.code === 'auth/email-already-in-use') message = "Ця пошта вже зареєстрована";
      if (error.code === 'auth/weak-password') message = "Пароль занадто короткий (мін. 6 символів)";
      
      Alert.alert("Помилка реєстрації", message);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      
      {/* KeyboardAvoidingView піднімає контент, коли виїжджає клавіатура */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          
          <View style={styles.header}>
            <Text style={styles.logo}>Rizix</Text>
            <Text style={styles.subtitle}>Створіть акаунт для доступу до PRO-аналітики</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{"Ім'я"}</Text>
            <TextInput
              style={styles.input}
              placeholder="Максим"
              placeholderTextColor="#64748B"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Електронна пошта</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Створити акаунт</Text>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.promptText}>Вже маєте акаунт? </Text>
            <TouchableOpacity onPress={() => router.push('/login' as any)}>
              <Text style={styles.loginLink}>Увійти</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  keyboardView: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    height: 55,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  promptText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  loginLink: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 'bold',
  }
});