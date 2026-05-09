import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/theme';

export default function Index() {
  const { user, isLoading, panelMode } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  const isAdmin = user.name?.toLowerCase().includes('asif');

  if (user.role === 'teacher') return <Redirect href="/(teacher)" />;
  if (user.role === 'cr' || isAdmin) {
    if (panelMode === 'teacher') return <Redirect href="/(teacher)" />;
    return <Redirect href="/(student)" />;
  }
  return <Redirect href="/(student)" />;
}
