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
import { AssignmentModal } from '../../components/ui/AssignmentModal';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Assignment } from '../../types';
import { SUBJECTS } from '../../constants/mockData';

const EMPTY: Partial<Assignment> = { title: '', subject: '', description: '', assigned_date: '', due_date: '', status: 'active' };

function computeStatus(assigned_date: string, due_date: string): Assignment['status'] {
  const today = new Date().toISOString().slice(0, 10);
  if (due_date && today > due_date) return 'overdue' as any;
  if (assigned_date && today >= assigned_date) return 'active';
  return 'pending';
}

export default function TeacherAssignments() {
  const { user } = useAuth();
  const { assignments, addAssignment, updateAssignment, deleteAssignment } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Partial<Assignment> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const openAdd = () => { setEditItem({ ...EMPTY }); setModalVisible(true); };
  const openEdit = (a: Assignment) => { setEditItem({ ...a }); setModalVisible(true); };

  const handleSave = () => {
    if (!editItem?.title?.trim()) return;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const assignedDate = editItem.id ? (editItem.assigned_date ?? today) : today;
    const autoStatus = computeStatus(assignedDate, editItem.due_date ?? '');
    if (editItem.id) {
      updateAssignment({ ...editItem, status: autoStatus, updated_by: user?.name ?? '', updated_at: now } as Assignment);
    } else {
      addAssignment({ ...editItem, status: autoStatus, assigned_date: today, created_by: user?.name ?? '', updated_by: user?.name ?? '', created_at: now, updated_at: now } as Assignment);
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
                <View style={styles.headerRow}>
                  <Text style={[styles.subject, { fontFamily: FF.regular, flex: 1, marginBottom: 0 }]} numberOfLines={1}>{item.subject}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <StatusBadge type={item.status as any} />
                    <TouchableOpacity style={styles.detailsBtn} onPress={() => setSelectedAssignment(item)}>
                      <MaterialIcons name="visibility" size={14} color={Colors.textSecondary} />
                      <Text style={[styles.detailsText, { fontFamily: FF.regular }]}>
                        {lang === 'bn' ? 'বিস্তারিত' : 'Details'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.title, { fontFamily: FF.semiBold, marginBottom: 4 }]}>{item.title}</Text>
                <Text style={[styles.desc, { fontFamily: FF.regular }]} numberOfLines={2}>{item.description}</Text>
                
                <View style={styles.divider} />
                
                <View style={styles.bottomRow}>
                  <View style={styles.datesContainer}>
                    <View style={styles.meta}>
                      <MaterialIcons name="event" size={14} color={Colors.textMuted} />
                      <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                        {lang === 'bn' ? 'শুরু:' : 'Start:'} {item.assigned_date}
                      </Text>
                    </View>
                    <View style={[styles.meta, { flexDirection: 'row', alignItems: 'center' }]}>
                      <MaterialIcons name="event-available" size={14} color={Colors.textMuted} />
                      <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                        {lang === 'bn' ? 'জমা:' : 'Due:'} {item.due_date}
                      </Text>
                      {item.updated_at && item.created_at && item.updated_at !== item.created_at ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 4 }}>
                          <MaterialIcons name="edit" size={10} color={Colors.textMuted} />
                          <Text style={{ fontSize: 10, color: Colors.textMuted, fontFamily: FF.medium }}>
                            {lang === 'bn' ? 'সম্পাদিত' : 'Edited'}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

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
                <TouchableOpacity onPress={() => { setModalVisible(false); setEditItem({ ...EMPTY }); }}>
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
                <TouchableOpacity style={styles.input} onPress={() => setSubjectOpen(true)}>
                  <Text style={[styles.dropdownText, { fontFamily: FF.regular }, !editItem?.subject && { color: Colors.textMuted }]} numberOfLines={1}>
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
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'বিবরণ' : 'Description'}</Text>
                <TextInput
                  style={[styles.input, styles.multiInput, { fontFamily: FF.regular }]}
                  value={editItem?.description ?? ''}
                  onChangeText={v => setEditItem(p => ({ ...p, description: v }))}
                  placeholder={lang === 'bn' ? 'বিবরণ লিখুন' : 'Enter description'}
                  placeholderTextColor={Colors.textMuted}
                  multiline numberOfLines={3} textAlignVertical="top"
                />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'জমার তারিখ' : 'Due Date'}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setCalendarOpen(true)}>
                  <Text style={[{ fontFamily: Fonts.en.regular, fontSize: FontSize.sm, flex: 1 }, !editItem?.due_date && { color: Colors.textMuted }]}>
                    {editItem?.due_date || (lang === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Select date')}
                  </Text>
                  <MaterialIcons name="calendar-today" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>

                {/* Calendar Picker Modal */}
                <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
                  <Pressable style={styles.dropdownOverlay} onPress={() => setCalendarOpen(false)}>
                    <View style={[styles.dropdownModal, { paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' }]}>
                      <Calendar
                        current={editItem?.due_date || new Date().toISOString().slice(0, 10)}
                        minDate={new Date().toISOString().slice(0, 10)}
                        onDayPress={(day: { dateString: string }) => { setEditItem(p => ({ ...p, due_date: day.dateString })); setCalendarOpen(false); }}
                        markedDates={editItem?.due_date ? { [editItem.due_date]: { selected: true, selectedColor: Colors.accent } } : {}}
                        theme={{ todayTextColor: Colors.accent, selectedDayBackgroundColor: Colors.accent, arrowColor: Colors.accent }}
                      />
                    </View>
                  </Pressable>
                </Modal>
                <View style={styles.modalBtns}>
                  <ActionButton label={lang === 'bn' ? 'বাতিল' : 'Cancel'} onPress={() => { setModalVisible(false); setEditItem({ ...EMPTY }); }} variant="secondary" style={{ flex: 1 }} />
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
        confirmVariant="danger"
      />

      <AssignmentModal
        visible={!!selectedAssignment}
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
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
  row: { flexDirection: 'row', gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2, gap: 8 },
  subject: { fontSize: FontSize.sm, color: Colors.accent, textTransform: 'uppercase' },
  title: { fontSize: FontSize.lg, color: Colors.textPrimary },
  desc: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  divider: { height: 1, backgroundColor: Colors.borderColor, marginBottom: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  datesContainer: { gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: 4 },
  editedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: Colors.bgSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, marginTop: 10, borderWidth: 1, borderColor: Colors.borderColor },
  editedPillText: { fontSize: 10, color: Colors.textMuted },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  btnRow: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderColor, justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { backgroundColor: Colors.dangerBg },
  detailsBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderColor,
    backgroundColor: Colors.white 
  },
  detailsText: { fontSize: FontSize.xs, color: Colors.textSecondary },
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
  dropdownOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  dropdownModal: { backgroundColor: Colors.white, borderRadius: Radius.xl, width: '100%', paddingVertical: 16, paddingHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  dropItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropItemActive: { backgroundColor: Colors.accentLight },
  dropItemText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
});
