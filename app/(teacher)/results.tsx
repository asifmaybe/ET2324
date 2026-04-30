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
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Result } from '../../types';
import { SUBJECTS, ALL_STUDENTS } from '../../constants/mockData';

const EXAM_TYPES_EN = ['Class Test', 'Quiz', 'Mid-Term', 'Final'];
const EXAM_TYPES_BN: Record<string, string> = {
  'Class Test': 'ক্লাস টেস্ট',
  'Quiz': 'কুইজ',
  'Mid-Term': 'মধ্যবর্তী পরীক্ষা',
  'Final': 'চূড়ান্ত পরীক্ষা',
};
const typeMap: Record<string, any> = { 'Class Test': 'classTest', 'Quiz': 'quiz', 'Mid-Term': 'midTerm', 'Final': 'final' };

export default function TeacherResults() {
  const { user } = useAuth();
  const { results, addResult } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [form, setForm] = useState({
    student_id: ALL_STUDENTS[0]?.roll_number ?? '',
    student_name: ALL_STUDENTS[0]?.name ?? '',
    subject: SUBJECTS[0],
    exam_type: 'Class Test',
    marks: '',
    total_marks: '20',
    date: '',
  });

  const handleSave = () => {
    if (!form.student_id || !form.marks) return;
    const now = new Date().toISOString();
    addResult({
      id: '',
      student_id: form.student_id,
      student_name: form.student_name,
      subject: form.subject,
      exam_type: form.exam_type,
      marks: parseFloat(form.marks) || 0,
      total_marks: parseFloat(form.total_marks) || 20,
      date: form.date || now.slice(0, 10),
      uploaded_by: user?.name ?? '',
      uploaded_at: now,
    } as Result);
    setModalVisible(false);
    setForm(f => ({ ...f, marks: '', date: '' }));
  };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'ফলাফল' : 'Results'} showPanelSwitch />
      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={18} color="#fff" />
        <Text style={[styles.addBtnText, { fontFamily: FF.semiBold }]}>
          {lang === 'bn' ? 'ফলাফল যোগ করুন' : 'Add Result'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text></View>}
        renderItem={({ item }: { item: Result }) => {
          const pct = Math.round((item.marks / item.total_marks) * 100);
          const isGood = pct >= 60;
          return (
            <Card padding={16}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { fontFamily: FF.semiBold }]}>{item.student_name}</Text>
                  <Text style={[styles.subject, { fontFamily: FF.regular }]} numberOfLines={1}>{item.subject}</Text>
                  <View style={styles.badgeRow}>
                    <StatusBadge
                      type={typeMap[item.exam_type] ?? 'classTest'}
                      customLabel={lang === 'bn' ? (EXAM_TYPES_BN[item.exam_type] ?? item.exam_type) : item.exam_type}
                    />
                  </View>
                  <Text style={[styles.meta, { fontFamily: Fonts.en.regular }]}>
                    {item.date} · {lang === 'bn' ? 'আপলোড:' : 'By:'} {item.uploaded_by}
                  </Text>
                </View>
                <View style={[styles.scoreBox, { borderColor: isGood ? Colors.accent : Colors.danger }]}>
                  <Text style={[styles.score, { fontFamily: Fonts.en.bold, color: isGood ? Colors.accent : Colors.danger }]}>{item.marks}</Text>
                  <View style={styles.scoreDivider} />
                  <Text style={[styles.scoreTotal, { fontFamily: Fonts.en.medium }]}>{item.total_marks}</Text>
                  <Text style={[styles.scorePct, { fontFamily: Fonts.en.regular }]}>{pct}%</Text>
                </View>
              </View>
            </Card>
          );
        }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                  {lang === 'bn' ? 'ফলাফল যোগ করুন' : 'Add Result'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'শিক্ষার্থী' : 'Student'}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setStudentOpen(!studentOpen)}>
                  <Text style={[styles.dropText, { fontFamily: FF.regular }]} numberOfLines={1}>{form.student_name} ({form.student_id})</Text>
                  <MaterialIcons name={studentOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                {studentOpen ? (
                  <View style={styles.dropdown}>
                    {ALL_STUDENTS.map(s => (
                      <TouchableOpacity key={s.id} style={[styles.dropItem, form.student_id === s.roll_number && styles.dropItemActive]}
                        onPress={() => { setForm(f => ({ ...f, student_id: s.roll_number, student_name: s.name })); setStudentOpen(false); }}>
                        <Text style={[styles.dropItemText, { fontFamily: FF.regular }, form.student_id === s.roll_number && { color: Colors.accent }]}>{s.name} ({s.roll_number})</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('subject')}</Text>
                <TouchableOpacity style={styles.input} onPress={() => setSubjectOpen(!subjectOpen)}>
                  <Text style={[styles.dropText, { fontFamily: FF.regular }]} numberOfLines={1}>{form.subject}</Text>
                  <MaterialIcons name={subjectOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                {subjectOpen ? (
                  <View style={styles.dropdown}>
                    {SUBJECTS.map(s => (
                      <TouchableOpacity key={s} style={[styles.dropItem, form.subject === s && styles.dropItemActive]}
                        onPress={() => { setForm(f => ({ ...f, subject: s })); setSubjectOpen(false); }}>
                        <Text style={[styles.dropItemText, { fontFamily: FF.regular }, form.subject === s && { color: Colors.accent }]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : null}
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('examType')}</Text>
                <View style={styles.typeRow}>
                  {EXAM_TYPES_EN.map(t => (
                    <TouchableOpacity key={t} style={[styles.typeChip, form.exam_type === t && styles.typeChipActive]}
                      onPress={() => setForm(f => ({ ...f, exam_type: t }))}>
                      <Text style={[styles.typeChipText, { fontFamily: FF.medium }, form.exam_type === t && { color: Colors.accent }]}>
                        {lang === 'bn' ? (EXAM_TYPES_BN[t] ?? t) : t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.marksRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'প্রাপ্ত নম্বর' : 'Marks Obtained'}</Text>
                    <TextInput style={[styles.input, { fontFamily: Fonts.en.regular }]} value={form.marks} onChangeText={v => setForm(f => ({ ...f, marks: v }))} keyboardType="numeric" placeholder="17" placeholderTextColor={Colors.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'মোট নম্বর' : 'Total Marks'}</Text>
                    <TextInput style={[styles.input, { fontFamily: Fonts.en.regular }]} value={form.total_marks} onChangeText={v => setForm(f => ({ ...f, total_marks: v }))} keyboardType="numeric" placeholder="20" placeholderTextColor={Colors.textMuted} />
                  </View>
                </View>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{tr('date')} (YYYY-MM-DD)</Text>
                <TextInput style={[styles.input, { fontFamily: Fonts.en.regular }]} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} placeholder="2026-04-15" placeholderTextColor={Colors.textMuted} />
                <View style={styles.modalBtns}>
                  <ActionButton label={tr('cancel')} onPress={() => setModalVisible(false)} variant="secondary" style={{ flex: 1 }} />
                  <ActionButton label={tr('save')} onPress={handleSave} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 11, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 12, alignSelf: 'flex-start' },
  addBtnText: { fontSize: FontSize.sm, color: '#fff' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  name: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 2 },
  subject: { fontSize: FontSize.sm, color: Colors.accent, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  meta: { fontSize: FontSize.xs, color: Colors.textMuted },
  scoreBox: { alignItems: 'center', borderRadius: Radius.md, borderWidth: 2, padding: 10, minWidth: 60 },
  score: { fontSize: FontSize.xl },
  scoreDivider: { height: 1, width: '80%', backgroundColor: Colors.borderColor, marginVertical: 3 },
  scoreTotal: { fontSize: FontSize.sm, color: Colors.textSecondary },
  scorePct: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, maxHeight: '92%', borderWidth: 1, borderColor: Colors.borderColor },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: FontSize.lg, color: Colors.textPrimary },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: Colors.bg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor, color: Colors.textPrimary, fontSize: FontSize.sm, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropText: { flex: 1, color: Colors.textPrimary, fontSize: FontSize.sm },
  dropdown: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor, overflow: 'hidden', marginTop: -6, marginBottom: 4, maxHeight: 200 },
  dropItem: { paddingHorizontal: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
  dropItemActive: { backgroundColor: Colors.accentLight },
  dropItemText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.borderColor },
  typeChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  typeChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  marksRow: { flexDirection: 'row', gap: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
});
