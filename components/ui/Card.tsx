import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
  padding?: number;
}

export function Card({ children, style, accent = false, padding = 16 }: Props) {
  return (
    <View style={[
      styles.card,
      { padding },
      accent && styles.accent,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  accent: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
  },
});
