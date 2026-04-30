import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { Notice } from '../../types';
import { useLang } from '../../hooks/useLang';

interface NoticeModalProps {
  visible: boolean;
  onClose: () => void;
  notice: Notice | null;
}

export function NoticeModal({ visible, onClose, notice }: NoticeModalProps) {
  const { lang } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  if (!notice) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.badge, notice.important && { backgroundColor: Colors.dangerLight }]}>
              <Text style={[styles.badgeText, { fontFamily: FF.medium }, notice.important && { color: Colors.danger }]}>
                {notice.important 
                  ? (lang === 'bn' ? 'গুরুত্বপূর্ণ' : 'Important') 
                  : (lang === 'bn' ? 'একাডেমিক' : 'Academic')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.title, { fontFamily: FF.bold }]}>{notice.title}</Text>
            <View style={styles.metaRow}>
              <MaterialIcons name="schedule" size={14} color={Colors.textMuted} />
              <Text style={[styles.metaText, { fontFamily: FF.regular }]}>
                {notice.date} • {notice.time}
              </Text>
              <Text style={[styles.metaText, { fontFamily: FF.regular, marginHorizontal: 4 }]}>|</Text>
              <MaterialIcons name="person-outline" size={14} color={Colors.textMuted} />
              <Text style={[styles.metaText, { fontFamily: FF.medium }]}>
                {notice.author || 'ADMIN'}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={[styles.description, { fontFamily: FF.regular }]}>
              {notice.description}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  badge: {
    backgroundColor: '#E6F0F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: FontSize.sm,
    color: '#1A5A8A',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    lineHeight: 28,
    marginTop: 8,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 16,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderColor,
    marginBottom: 16,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
