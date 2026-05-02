import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, View, Text } from 'react-native';
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

  const pill = (icon: any, label: string, focused: boolean, color: string) => (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        backgroundColor: focused ? Colors.accentLight : 'transparent',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingTop: 2,
        paddingBottom: 2,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 52,
      }}>
        <MaterialIcons name={icon} size={24} color={color} />
        <Text style={{ color, fontSize: 9.5, fontFamily: FF.medium, marginTop: 2 }}>{label}</Text>
      </View>
    </View>
  );

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle,
      tabBarActiveTintColor: Colors.accent,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen name="index" options={{
        title: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
        tabBarIcon: ({ color, focused }) => pill('home', lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', focused, color),
        tabBarItemStyle: { marginLeft: 8 },
      }} />
      <Tabs.Screen name="assignments" options={{
        title: lang === 'bn' ? 'কাজ' : 'Assign',
        tabBarIcon: ({ color, focused }) => pill('assignment', lang === 'bn' ? 'কাজ' : 'Assign', focused, color),
      }} />
      <Tabs.Screen name="exams" options={{
        title: lang === 'bn' ? 'পরীক্ষা' : 'Exams',
        tabBarIcon: ({ color, focused }) => pill('school', lang === 'bn' ? 'পরীক্ষা' : 'Exams', focused, color),
      }} />
      <Tabs.Screen name="attendance" options={{
        title: lang === 'bn' ? 'উপস্থিতি' : 'Attend.',
        tabBarIcon: ({ color, focused }) => pill('people', lang === 'bn' ? 'উপস্থিতি' : 'Attend.', focused, color),
      }} />
      <Tabs.Screen name="results" options={{
        title: lang === 'bn' ? 'ফলাফল' : 'Results',
        href: null,
        tabBarIcon: ({ color, focused }) => pill('bar-chart', lang === 'bn' ? 'ফলাফল' : 'Results', focused, color),
      }} />
      <Tabs.Screen name="activities" options={{
        title: lang === 'bn' ? 'কার্যকলাপ' : 'Activities',
        href: null,
      }} />
      <Tabs.Screen name="notices" options={{
        title: lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices',
        tabBarIcon: ({ color, focused }) => pill('campaign', lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices', focused, color),
        tabBarItemStyle: { marginRight: 8 },
      }} />
    </Tabs>
  );
}
