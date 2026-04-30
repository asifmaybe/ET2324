import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

export function FormInput({ label, containerStyle, ...props }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, props.multiline && styles.multiline]}
        placeholderTextColor={Colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 46,
  },
  multiline: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
});
