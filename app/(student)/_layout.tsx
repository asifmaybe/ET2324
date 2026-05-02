import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Platform, View, Text } from 'react-native';
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
    height: Platform.select({ ios: insets.bottom + 64, android: insets.bottom + 64, default: 68 }),
    paddingTop: 14,
    paddingBottom: Platform.select({ ios: insets.bottom + 4, android: 12, default: 8 }),
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
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
      }}>
        <MaterialIcons name={icon} size={26} color={color} />
        <Text style={{ color, fontSize: 10, fontFamily: FF.medium, marginTop: 1 }} numberOfLines={1}>{label}</Text>
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
        title: lang === 'bn' ? 'হোম' : 'Home',
        tabBarIcon: ({ color, focused }) => pill('home', lang === 'bn' ? 'হোম' : 'Home', focused, color),
        tabBarItemStyle: { marginLeft: 8 },
      }} />
      <Tabs.Screen name="assignments" options={{
        title: tr('navAssignments'),
        tabBarIcon: ({ color, focused }) => pill('menu-book', tr('navAssignments'), focused, color),
      }} />
      <Tabs.Screen name="exams" options={{
        title: tr('navExams'),
        tabBarIcon: ({ color, focused }) => pill('school', tr('navExams'), focused, color),
      }} />
      <Tabs.Screen name="attendance" options={{
        title: tr('navAttendance'),
        href: null,
        tabBarIcon: ({ color, focused }) => pill('person-outline', tr('navAttendance'), focused, color),
      }} />
      <Tabs.Screen name="results" options={{
        title: tr('navResults'),
        href: null,
        tabBarIcon: ({ color, focused }) => pill('bar-chart', tr('navResults'), focused, color),
      }} />
      <Tabs.Screen name="routine" options={{
        title: tr('navRoutine'),
        tabBarIcon: ({ color, focused }) => pill('calendar-today', tr('navRoutine'), focused, color),
      }} />
      <Tabs.Screen name="notices" options={{
        title: lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices',
        tabBarIcon: ({ color, focused }) => pill('campaign', lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices', focused, color),
        tabBarItemStyle: { marginRight: 8 },
      }} />
    </Tabs>
  );
}
