import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { useLang } from '../../hooks/useLang';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function ActionButton({ label, onPress, variant = 'primary', loading, disabled, style, fullWidth = false }: Props) {
  const { lang } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const bg = variant === 'primary' ? Colors.accent
    : variant === 'danger' ? Colors.danger
    : variant === 'ghost' ? 'transparent'
    : Colors.bgTertiary;

  const textColor = variant === 'primary' ? '#FFFFFF'
    : variant === 'danger' ? '#fff'
    : variant === 'ghost' ? Colors.textSecondary
    : Colors.textPrimary;

  const borderColor = variant === 'secondary' ? Colors.borderColor : 'transparent';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, borderColor, borderWidth: variant === 'secondary' ? 1 : 0 }, fullWidth && styles.fullWidth, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator size="small" color={textColor} /> : (
        <Text style={[styles.text, { color: textColor, fontFamily: FF.semiBold }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  fullWidth: { width: '100%' },
  text: { fontSize: FontSize.md },
});
