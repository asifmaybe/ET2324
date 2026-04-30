import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';
import { Colors, Fonts } from '../../constants/theme';

export default function StudentLayout() {
  const insets = useSafeAreaInsets();
  const { user, panelMode } = useAuth();
  const { tr, lang } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role === 'teacher') { router.replace('/(teacher)'); return; }
    if (user.role === 'cr' && panelMode === 'teacher') { router.replace('/(teacher)'); return; }
  }, [user, panelMode]);

  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const tabBarStyle = {
    backgroundColor: Colors.tabBg,
    borderTopColor: Colors.tabBorder,
    borderTopWidth: 1,
    height: Platform.select({ ios: insets.bottom + 62, android: insets.bottom + 62, default: 72 }),
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: insets.bottom + 8, android: insets.bottom + 8, default: 8 }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  };

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: Colors.accent,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarLabelStyle: { fontSize: 10, fontFamily: FF.medium },
    }}>
      <Tabs.Screen name="index" options={{
        title: lang === 'bn' ? 'হোম' : 'Home',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="grid-view" size={size} color={color} />,
      }} />
      <Tabs.Screen name="assignments" options={{
        title: tr('navAssignments'),
        tabBarIcon: ({ color, size }) => <MaterialIcons name="menu-book" size={size} color={color} />,
      }} />
      <Tabs.Screen name="exams" options={{
        title: tr('navExams'),
        tabBarIcon: ({ color, size }) => <MaterialIcons name="school" size={size} color={color} />,
      }} />
      <Tabs.Screen name="attendance" options={{
        title: tr('navAttendance'),
        tabBarIcon: ({ color, size }) => <MaterialIcons name="person-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="results" options={{
        title: tr('navResults'),
        tabBarIcon: ({ color, size }) => <MaterialIcons name="bar-chart" size={size} color={color} />,
      }} />
      <Tabs.Screen name="routine" options={{
        title: tr('navRoutine'),
        tabBarIcon: ({ color, size }) => <MaterialIcons name="calendar-today" size={size} color={color} />,
      }} />
    </Tabs>
  );
}
