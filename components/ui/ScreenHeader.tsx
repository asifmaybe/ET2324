import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts } from '../../constants/theme';
import { useLang } from '../../hooks/useLang';

import { HamburgerMenu } from './HamburgerMenu';

interface Props {
  title: string;
  subtitle?: string;
  showLogout?: boolean;
  showNotification?: boolean;

  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, showLogout = false, showNotification = false, onBack }: Props) {
  const { lang } = useLang();

  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.title, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { fontFamily: FF.regular }]}>{subtitle}</Text>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        {showNotification ? (
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="notifications-none" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
        <HamburgerMenu />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: Colors.bg,
  },
  left: { flex: 1 },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
});
