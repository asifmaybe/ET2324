import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';
import { Colors, Fonts } from '../../constants/theme';

export default function TeacherLayout() {
  const insets = useSafeAreaInsets();
  const { user, panelMode } = useAuth();
  const { tr, lang } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    if (user.role === 'student') { router.replace('/(student)'); return; }
    if (user.role === 'cr' && panelMode === 'student') { router.replace('/(student)'); return; }
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
        title: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="grid-view" size={size} color={color} />,
        tabBarItemStyle: { paddingLeft: 16 },
      }} />
      <Tabs.Screen name="assignments" options={{
        title: lang === 'bn' ? 'কাজ' : 'Assign',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="assignment" size={size} color={color} />,
      }} />
      <Tabs.Screen name="exams" options={{
        title: lang === 'bn' ? 'পরীক্ষা' : 'Exams',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="school" size={size} color={color} />,
      }} />
      <Tabs.Screen name="attendance" options={{
        title: lang === 'bn' ? 'উপস্থিতি' : 'Attend.',
        href: null,
        tabBarIcon: ({ color, size }) => <MaterialIcons name="people" size={size} color={color} />,
      }} />
      <Tabs.Screen name="results" options={{
        title: lang === 'bn' ? 'ফলাফল' : 'Results',
        href: null,
        tabBarIcon: ({ color, size }) => <MaterialIcons name="bar-chart" size={size} color={color} />,
      }} />
      <Tabs.Screen name="notices" options={{
        title: lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices',
        tabBarIcon: ({ color, size }) => <MaterialIcons name="campaign" size={size} color={color} />,
        tabBarItemStyle: { paddingRight: 16 },
      }} />
    </Tabs>
  );
}
