import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { Assignment } from '../../types';
import { useLang } from '../../hooks/useLang';
import { StatusBadge } from './StatusBadge';

interface AssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

export function AssignmentModal({ visible, onClose, assignment }: AssignmentModalProps) {
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  if (!assignment) return null;

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
            <View style={styles.badgeWrapper}>
              <StatusBadge type={assignment.status as any} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.subject, { fontFamily: FF.semiBold }]}>
              {assignment.subject}
            </Text>
            <Text style={[styles.title, { fontFamily: FF.bold }]}>{assignment.title}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <MaterialIcons name="event" size={14} color={Colors.textMuted} />
                <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                  {lang === 'bn' ? 'শুরু:' : 'Start:'} {assignment.assigned_date}
                </Text>
              </View>
              <View style={styles.metaBox}>
                <MaterialIcons name="event-available" size={14} color={Colors.textMuted} />
                <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                  {lang === 'bn' ? 'জমা:' : 'Due:'} {assignment.due_date}
                </Text>
              </View>
            </View>

            {assignment.updated_at && assignment.created_at && assignment.updated_at !== assignment.created_at ? (
              <View style={styles.editedPill}>
                <MaterialIcons name="edit" size={11} color={Colors.textMuted} />
                <Text style={[styles.editedPillText, { fontFamily: FF.regular }]}>
                  {lang === 'bn' ? 'শেষ সম্পাদনা:' : 'Last edited by'} {assignment.updated_by} • {new Date(assignment.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            <Text style={[styles.description, { fontFamily: FF.regular }]}>
              {assignment.description}
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
  badgeWrapper: {
    flexDirection: 'row',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  subject: {
    fontSize: FontSize.md,
    color: Colors.accent,
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  editedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.borderColor,
  },
  editedPillText: { fontSize: 10, color: Colors.textMuted },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
