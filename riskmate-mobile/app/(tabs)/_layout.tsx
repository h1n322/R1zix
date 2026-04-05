import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs>
  <Tabs.Screen
    name="index" // Тепер це Explore
    options={{
      title: 'Ринок',
      tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
    }}
  />
  <Tabs.Screen
    name="analysis" // Твій колишній index
    options={{
      title: 'Аналіз',
      tabBarIcon: ({ color }) => <Ionicons name="analytics" size={24} color={color} />,
    }}
  />
</Tabs>
  );
}
