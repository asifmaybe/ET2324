import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ScrollView, TextInput, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
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
const EMPTY: Partial<Exam> = { subject: '', type: 'Class Test', date: '', marks: 0, instructions: '', upcoming: true };

export default function TeacherExams() {
  const { user } = useAuth();
  const { exams, addExam, updateExam, deleteExam } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Exam> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const filtered = exams.filter(e => e.upcoming === (tab === 'upcoming'));
  const typeMap: Record<string, any> = { 'Class Test': 'classTest', 'Quiz': 'quiz', 'Mid-Term': 'midTerm', 'Final': 'final' };

  const openAdd = () => { setEditItem({ ...EMPTY }); setModalVisible(true); };
  const openEdit = (e: Exam) => { setEditItem({ ...e }); setModalVisible(true); };
  const handleSave = () => {
    if (!editItem?.subject?.trim()) return;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const autoUpcoming = !editItem.date || editItem.date >= today;
    if (editItem.id) {
      updateExam({ ...editItem, upcoming: autoUpcoming, updated_by: user?.name ?? '', updated_at: now } as Exam);
    } else {
      addExam({ ...editItem, upcoming: autoUpcoming, created_by: user?.name ?? '', updated_by: user?.name ?? '', created_at: now, updated_at: now } as Exam);
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
                {item.updated_at && item.created_at && item.updated_at !== item.created_at ? (
                  <View style={styles.editedPill}>
                    <MaterialIcons name="edit" size={11} color={Colors.textMuted} />
                    <Text style={[styles.editedPillText, { fontFamily: FF.regular }]}>
                      {lang === 'bn' ? 'সর্বশেষ সংশোধন:' : 'Last edited by'} {item.updated_by} • {new Date(item.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ) : null}
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
                <TouchableOpacity onPress={() => { setModalVisible(false); setEditItem({ ...EMPTY }); }}>
                  <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('subject')}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setSubjectOpen(true)}>
                  <Text style={[styles.dropText, { fontFamily: FF.regular }, !editItem?.subject && { color: Colors.textMuted }]} numberOfLines={1}>
                    {editItem?.subject || (lang === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Select Subject')}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* Subject Picker Modal */}
                <Modal visible={subjectOpen} transparent animationType="fade" onRequestClose={() => setSubjectOpen(false)}>
                  <Pressable style={styles.dropdownOverlay} onPress={() => setSubjectOpen(false)}>
                    <View style={styles.dropdownModal}>
                      {/* Default "Select Subject" option */}
                      <TouchableOpacity style={styles.dropItem}
                        onPress={() => { setEditItem(p => ({ ...p, subject: '' })); setSubjectOpen(false); }}>
                        <Text style={[styles.dropItemText, { fontFamily: FF.regular, color: Colors.textMuted }]}>
                          {lang === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Select Subject'}
                        </Text>
                      </TouchableOpacity>
                      {SUBJECTS.map(s => (
                        <TouchableOpacity key={s} style={[styles.dropItem, editItem?.subject === s && styles.dropItemActive]}
                          onPress={() => { setEditItem(p => ({ ...p, subject: s })); setSubjectOpen(false); }}>
                          <Text style={[styles.dropItemText, { fontFamily: FF.regular }, editItem?.subject === s && { color: Colors.accent }]} numberOfLines={1}>{s}</Text>
                          {editItem?.subject === s && <MaterialIcons name="check" size={18} color={Colors.accent} />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Pressable>
                </Modal>
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
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('date')}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setCalendarOpen(true)}>
                  <Text style={[{ fontFamily: Fonts.en.regular, fontSize: FontSize.sm, flex: 1 }, !editItem?.date && { color: Colors.textMuted }]}>
                    {editItem?.date || (lang === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Select date')}
                  </Text>
                  <MaterialIcons name="calendar-today" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* Calendar Picker Modal */}
                <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
                  <Pressable style={styles.dropdownOverlay} onPress={() => setCalendarOpen(false)}>
                    <View style={[styles.dropdownModal, { paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' }]}>
                      <Calendar
                        current={editItem?.date || new Date().toISOString().slice(0, 10)}
                        onDayPress={(day: { dateString: string }) => { setEditItem(p => ({ ...p, date: day.dateString })); setCalendarOpen(false); }}
                        markedDates={editItem?.date ? { [editItem.date]: { selected: true, selectedColor: Colors.accent } } : {}}
                        theme={{ todayTextColor: Colors.accent, selectedDayBackgroundColor: Colors.accent, arrowColor: Colors.accent }}
                      />
                    </View>
                  </Pressable>
                </Modal>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('marks')}</Text>
                <TextInput style={[styles.input, { fontFamily: Fonts.en.regular }]} value={editItem?.marks ? String(editItem.marks) : ''} onChangeText={v => setEditItem(p => ({ ...p, marks: parseInt(v) || 0 }))} keyboardType="numeric" placeholder={lang === 'bn' ? 'নম্বর লিখুন' : 'Input marks'} placeholderTextColor={Colors.textMuted} />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('instructions')}</Text>
                <TextInput style={[styles.input, styles.multiInput, { fontFamily: FF.regular }]} value={editItem?.instructions ?? ''} onChangeText={v => setEditItem(p => ({ ...p, instructions: v }))} placeholder={lang === 'bn' ? 'নির্দেশনা লিখুন' : 'Enter instructions'} placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} textAlignVertical="top" />
                <View style={styles.modalBtns}>
                  <ActionButton label={tr('cancel')} onPress={() => { setModalVisible(false); setEditItem({ ...EMPTY }); }} variant="secondary" style={{ flex: 1 }} />
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
    position: 'absolute', bottom: 28, right: 20,
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
  editedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: Colors.bgSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, marginTop: 10, borderWidth: 1, borderColor: Colors.borderColor },
  editedPillText: { fontSize: 10, color: Colors.textMuted },
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
  dropdownOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  dropdownModal: { backgroundColor: Colors.white, borderRadius: Radius.xl, width: '100%', paddingVertical: 16, paddingHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  dropItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropItemActive: { backgroundColor: Colors.accentLight },
  dropItemText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderColor },
  typeChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  typeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
});
