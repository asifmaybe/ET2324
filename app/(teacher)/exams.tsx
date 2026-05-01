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
import { Exam } from '../../types';
import { SUBJECTS } from '../../constants/mockData';

const EXAM_TYPES_EN = ['Class Test', 'Quiz', 'Mid-Term', 'Final'];
const EXAM_TYPES_BN: Record<string, string> = {
  'Class Test': 'ক্লাস টেস্ট',
  'Quiz': 'কুইজ',
  'Mid-Term': 'মধ্যবর্তী পরীক্ষা',
  'Final': 'চূড়ান্ত পরীক্ষা',
};
const EMPTY: Partial<Exam> = { subject: SUBJECTS[0], type: 'Class Test', date: '', marks: 20, instructions: '', upcoming: true };

export default function TeacherExams() {
  const { user } = useAuth();
  const { exams, addExam, updateExam, deleteExam } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Exam> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const filtered = exams.filter(e => e.upcoming === (tab === 'upcoming'));
  const typeMap: Record<string, any> = { 'Class Test': 'classTest', 'Quiz': 'quiz', 'Mid-Term': 'midTerm', 'Final': 'final' };

  const openAdd = () => { setEditItem({ ...EMPTY }); setModalVisible(true); };
  const openEdit = (e: Exam) => { setEditItem({ ...e }); setModalVisible(true); };
  const handleSave = () => {
    if (!editItem?.subject?.trim()) return;
    const now = new Date().toISOString();
    if (editItem.id) {
      updateExam({ ...editItem, updated_by: user?.name ?? '', updated_at: now } as Exam);
    } else {
      addExam({ ...editItem, created_by: user?.name ?? '', updated_by: user?.name ?? '', created_at: now, updated_at: now } as Exam);
    }
    setModalVisible(false);
  };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'পরীক্ষা' : 'Exams'} />
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'upcoming' && styles.tabActive]} onPress={() => setTab('upcoming')}>
          <Text style={[styles.tabText, { fontFamily: FF.medium }, tab === 'upcoming' && styles.tabTextActive]}>{tr('upcoming')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'past' && styles.tabActive]} onPress={() => setTab('past')}>
          <Text style={[styles.tabText, { fontFamily: FF.medium }, tab === 'past' && styles.tabTextActive]}>{tr('past')}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text></View>}
        renderItem={({ item }: { item: Exam }) => (
          <Card padding={16}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subject, { fontFamily: FF.semiBold }]}>{item.subject}</Text>
                <View style={styles.badgeRow}>
                  <StatusBadge type={typeMap[item.type] ?? 'classTest'} customLabel={lang === 'bn' ? (EXAM_TYPES_BN[item.type] ?? item.type) : item.type} />
                  <StatusBadge type={item.upcoming ? 'upcoming' : 'past'} />
                  <View style={styles.marksBadge}>
                    <MaterialIcons name="assessment" size={11} color={Colors.textSecondary} />
                    <Text style={[styles.marksText, { fontFamily: FF.medium }]}>
                      {item.marks} {lang === 'bn' ? 'নম্বর' : 'marks'}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <MaterialIcons name="event" size={12} color={Colors.textMuted} />
                  <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>{item.date}</Text>
                </View>
                {item.instructions ? <Text style={[styles.instr, { fontFamily: FF.regular }]} numberOfLines={2}>{item.instructions}</Text> : null}
              </View>
              <View style={styles.btnCol}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                  <MaterialIcons name="edit" size={16} color={Colors.info} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => setDeleteId(item.id)}>
                  <MaterialIcons name="delete-outline" size={16} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd} activeOpacity={0.85}>
        <MaterialIcons name="add" size={22} color="#fff" />
        <Text style={[styles.fabText, { fontFamily: FF.semiBold }]}>
          {lang === 'bn' ? 'নতুন পরীক্ষা' : 'New Exam'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                  {editItem?.id ? tr('editAssignment') : tr('addExam')}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('subject')}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setSubjectOpen(!subjectOpen)}>
                  <Text style={[styles.dropText, { fontFamily: FF.regular }]} numberOfLines={1}>{editItem?.subject}</Text>
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
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('examType')}</Text>
                <View style={styles.typeRow}>
                  {EXAM_TYPES_EN.map(t => (
                    <TouchableOpacity key={t} style={[styles.typeChip, editItem?.type === t && styles.typeChipActive]} onPress={() => setEditItem(p => ({ ...p, type: t }))}>
                      <Text style={[styles.typeChipText, { fontFamily: FF.medium }, editItem?.type === t && { color: Colors.accent }]}>
                        {lang === 'bn' ? (EXAM_TYPES_BN[t] ?? t) : t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('date')} (YYYY-MM-DD)</Text>
                <TextInput style={[styles.input, { fontFamily: Fonts.en.regular }]} value={editItem?.date ?? ''} onChangeText={v => setEditItem(p => ({ ...p, date: v }))} placeholder="2026-05-05" placeholderTextColor={Colors.textMuted} />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('marks')}</Text>
                <TextInput style={[styles.input, { fontFamily: Fonts.en.regular }]} value={String(editItem?.marks ?? 20)} onChangeText={v => setEditItem(p => ({ ...p, marks: parseInt(v) || 0 }))} keyboardType="numeric" placeholderTextColor={Colors.textMuted} />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('instructions')}</Text>
                <TextInput style={[styles.input, styles.multiInput, { fontFamily: FF.regular }]} value={editItem?.instructions ?? ''} onChangeText={v => setEditItem(p => ({ ...p, instructions: v }))} placeholder={lang === 'bn' ? 'নির্দেশনা লিখুন' : 'Enter instructions'} placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} textAlignVertical="top" />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'অবস্থা' : 'Status'}</Text>
                <View style={styles.typeRow}>
                  {[true, false].map(v => (
                    <TouchableOpacity key={String(v)} style={[styles.typeChip, editItem?.upcoming === v && styles.typeChipActive]} onPress={() => setEditItem(p => ({ ...p, upcoming: v }))}>
                      <Text style={[styles.typeChipText, { fontFamily: FF.medium }, editItem?.upcoming === v && { color: Colors.accent }]}>
                        {v ? tr('upcoming') : tr('past')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.modalBtns}>
                  <ActionButton label={tr('cancel')} onPress={() => setModalVisible(false)} variant="secondary" style={{ flex: 1 }} />
                  <ActionButton label={tr('save')} onPress={handleSave} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DeleteModal
        visible={!!deleteId}
        message={tr('deleteConfirm')}
        onConfirm={() => { if (deleteId) deleteExam(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
        confirmLabel={tr('delete')}
        cancelLabel={tr('cancel')}
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
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.accent },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  subject: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: 4 },
  marksBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgSecondary, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor,
  },
  marksText: { fontSize: 10, color: Colors.textSecondary },
  instr: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 17, marginTop: 4 },
  btnCol: { gap: 8 },
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
  dropText: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm },
  dropdown: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor, overflow: 'hidden', marginTop: -6, marginBottom: 4 },
  dropItem: { paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
  dropItemActive: { backgroundColor: Colors.accentLight },
  dropItemText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderColor },
  typeChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  typeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
});
