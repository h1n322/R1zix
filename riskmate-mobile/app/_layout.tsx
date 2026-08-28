import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ 
        headerStyle: { backgroundColor: '#0B0E14' },
        headerTintColor: '#f8fafc',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#000000' }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Авторизація', headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Реєстрація', headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Особистий кабінет' }} />
        <Stack.Screen name="portfolio" options={{ title: 'Мої портфелі' }} />
        <Stack.Screen name="pricing" options={{ title: 'Тарифи' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
