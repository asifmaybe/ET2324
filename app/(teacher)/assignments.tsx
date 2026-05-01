import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionButton } from '../../components/ui/ActionButton';
import { DeleteModal } from '../../components/ui/DeleteModal';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Assignment } from '../../types';
import { SUBJECTS } from '../../constants/mockData';

const STATUS_OPTIONS_EN = ['active', 'pending', 'completed'];
const STATUS_OPTIONS_LABEL: Record<string, string> = { active: 'Ongoing', pending: 'Pending', completed: 'Completed' };
const STATUS_BN: Record<string, string> = { active: 'চলমান', pending: 'মুলতুবি', completed: 'সম্পন্ন' };
const EMPTY: Partial<Assignment> = { title: '', subject: SUBJECTS[0], description: '', assigned_date: '', due_date: '', status: 'active' };

export default function TeacherAssignments() {
  const { user } = useAuth();
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Assignment> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subjectOpen, setSubjectOpen] = useState(false);

  const openAdd = () => { setEditItem({ ...EMPTY }); setModalVisible(true); };
  const openEdit = (a: Assignment) => { setEditItem({ ...a }); setModalVisible(true); };

  const handleSave = () => {
    if (!editItem?.title?.trim()) return;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    if (editItem.id) {
      updateAssignment({ ...editItem, updated_by: user?.name ?? '', updated_at: now } as Assignment);
    } else {
      addAssignment({ ...editItem, assigned_date: today, created_by: user?.name ?? '', updated_by: user?.name ?? '', created_at: now, updated_at: now } as Assignment);
    }
    setModalVisible(false);
  };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'অ্যাসাইনমেন্ট' : 'Assignments'} />
      <FlatList
        data={assignments}
        keyExtractor={i => i.id}
        renderItem={({ item }: { item: Assignment }) => (
          <Card padding={16}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subject, { fontFamily: FF.regular, marginBottom: 2 }]}>{item.subject}</Text>
                <Text style={[styles.title, { fontFamily: FF.semiBold, marginBottom: 4 }]}>{item.title}</Text>
                <Text style={[styles.desc, { fontFamily: FF.regular }]} numberOfLines={2}>{item.description}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.meta}>
                    <MaterialIcons name="event" size={12} color={Colors.textMuted} />
                    <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                      {lang === 'bn' ? 'শুরু:' : 'Start:'} {item.assigned_date}
                    </Text>
                  </View>
                  <View style={styles.meta}>
                    <MaterialIcons name="event-available" size={12} color={Colors.textMuted} />
                    <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                      {lang === 'bn' ? 'জমা:' : 'Due:'} {item.due_date}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <StatusBadge type={item.status as any} />
                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                    <MaterialIcons name="edit" size={16} color={Colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => setDeleteId(item.id)}>
                    <MaterialIcons name="delete-outline" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text></View>}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
        <MaterialIcons name="add" size={22} color="#fff" />
        <Text style={[styles.fabText, { fontFamily: FF.semiBold }]}>
          {lang === 'bn' ? 'নতুন অ্যাসাইনমেন্ট' : 'New Assignment'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                  {editItem?.id
                    ? (lang === 'bn' ? 'সম্পাদনা করুন' : 'Edit Assignment')
                    : (lang === 'bn' ? 'নতুন অ্যাসাইনমেন্ট' : 'New Assignment')}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'শিরোনাম' : 'Title'} *</Text>
                <TextInput
                  style={[styles.input, { fontFamily: FF.regular }]}
                  value={editItem?.title ?? ''}
                  onChangeText={v => setEditItem(p => ({ ...p, title: v }))}
                  placeholder={lang === 'bn' ? 'শিরোনাম লিখুন' : 'Enter title'}
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'বিষয়' : 'Subject'}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setSubjectOpen(!subjectOpen)}>
                  <Text style={[styles.dropdownText, { fontFamily: FF.regular }]} numberOfLines={1}>{editItem?.subject ?? SUBJECTS[0]}</Text>
                  <MaterialIcons name={subjectOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                {subjectOpen ? (
                  <View style={styles.dropdown}>
                    {SUBJECTS.map(s => (
                      <TouchableOpacity key={s} style={[styles.dropItem, editItem?.subject === s && styles.dropItemActive]} onPress={() => { setEditItem(p => ({ ...p, subject: s })); setSubjectOpen(false); }}>
                        <Text style={[styles.dropItemText, { fontFamily: FF.regular }, editItem?.subject === s && { color: Colors.accent }]} numberOfLines={1}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'বিবরণ' : 'Description'}</Text>
                <TextInput
                  style={[styles.input, styles.multiInput, { fontFamily: FF.regular }]}
                  value={editItem?.description ?? ''}
                  onChangeText={v => setEditItem(p => ({ ...p, description: v }))}
                  placeholder={lang === 'bn' ? 'বিবরণ লিখুন' : 'Enter description'}
                  placeholderTextColor={Colors.textMuted}
                  multiline numberOfLines={3} textAlignVertical="top"
                />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'জমার তারিখ' : 'Due Date'} (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { fontFamily: Fonts.en.regular }]}
                  value={editItem?.due_date ?? ''}
                  onChangeText={v => setEditItem(p => ({ ...p, due_date: v }))}
                  placeholder="2026-05-15"
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'অবস্থা' : 'Status'}</Text>
                <View style={styles.statusRow}>
                  {STATUS_OPTIONS_EN.map(s => (
                    <TouchableOpacity key={s} style={[styles.statusChip, editItem?.status === s && styles.statusChipActive]} onPress={() => setEditItem(p => ({ ...p, status: s as any }))}>
                      <Text style={[styles.statusChipText, { fontFamily: FF.medium }, editItem?.status === s && { color: Colors.accent }]}>
                        {lang === 'bn' ? (STATUS_BN[s] ?? s) : (STATUS_OPTIONS_LABEL[s] ?? s)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalBtns}>
                  <ActionButton label={lang === 'bn' ? 'বাতিল' : 'Cancel'} onPress={() => setModalVisible(false)} variant="secondary" style={{ flex: 1 }} />
                  <ActionButton label={lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save'} onPress={handleSave} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DeleteModal
        visible={!!deleteId}
        message={lang === 'bn' ? 'আপনি কি মুছতে চান?' : 'Are you sure you want to delete?'}
        onConfirm={() => { if (deleteId) deleteAssignment(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
        confirmLabel={lang === 'bn' ? 'মুছুন' : 'Delete'}
        cancelLabel={lang === 'bn' ? 'বাতিল' : 'Cancel'}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 28, right: 32,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent, borderRadius: Radius.xl,
    paddingVertical: 13, paddingHorizontal: 14,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  fabText: { fontSize: FontSize.md, color: '#fff' },
  row: { flexDirection: 'row', gap: 10 },
  title: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 3 },
  subject: { fontSize: FontSize.sm, color: Colors.accent, marginBottom: 4 },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 19, marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  btnRow: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderColor, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { backgroundColor: Colors.dangerBg },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, maxHeight: '90%', borderWidth: 1, borderColor: Colors.borderColor },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: FontSize.lg, color: Colors.textPrimary },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: Colors.bg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor, color: Colors.textPrimary, fontSize: FontSize.sm, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  multiInput: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },
  dropdownText: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm },
  dropdown: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor, overflow: 'hidden', marginTop: -6, marginBottom: 4 },
  dropItem: { paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
  dropItemActive: { backgroundColor: Colors.accentLight },
  dropItemText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  statusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  statusChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderColor },
  statusChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  statusChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
});
