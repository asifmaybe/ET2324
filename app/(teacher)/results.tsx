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
import { Result, Exam } from '../../types';
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
  const { results, exams, addResult } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    subject: SUBJECTS[0],
    exam_type: 'Class Test',
    total_marks: '20',
    date: '',
  });
  const [rollInput, setRollInput] = useState('');
  const [processedResults, setProcessedResults] = useState<{ student_id: string; student_name: string; marks: number }[] | null>(null);

  const handleProcess = () => {
    const lines = rollInput.split('\n').map(l => l.trim()).filter(Boolean);
    const parsed: { student_id: string; student_name: string; marks: number }[] = [];
    lines.forEach(line => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const roll = parts[0];
        const marks = parseFloat(parts[1]);
        const student = ALL_STUDENTS.find(s => s.roll_number === roll);
        if (student) {
          parsed.push({
            student_id: roll,
            student_name: student.name,
            marks: isNaN(marks) ? 0 : marks,
          });
        }
      }
    });
    parsed.sort((a, b) => a.student_id.localeCompare(b.student_id));
    setProcessedResults(parsed);
  };

  const handleSave = () => {
    if (!processedResults || processedResults.length === 0) return;
    const now = new Date().toISOString();
    
    processedResults.forEach(pr => {
      addResult({
        id: '',
        student_id: pr.student_id,
        student_name: pr.student_name,
        subject: form.subject,
        exam_type: form.exam_type,
        marks: pr.marks,
        total_marks: parseFloat(form.total_marks) || 20,
        date: form.date || now.slice(0, 10),
        uploaded_by: user?.name ?? '',
        uploaded_at: now,
      } as Result);
    });

    setModalVisible(false);
    setRollInput('');
    setProcessedResults(null);
  };

  const categories = [
    { id: 'Class Tests', titleEn: 'Class Tests', titleBn: 'ক্লাস টেস্ট', icon: 'assignment' },
    { id: 'Mid-term', titleEn: 'Mid-term', titleBn: 'মধ্যবর্তী পরীক্ষা', icon: 'grading' },
    { id: 'Board', titleEn: 'Board', titleBn: 'বোর্ড পরীক্ষা', icon: 'school' }
  ];

  const filteredExams = selectedCategory 
    ? exams.filter(e => {
        if (selectedCategory === 'Class Tests') return e.type === 'Class Test';
        if (selectedCategory === 'Mid-term') return e.type === 'Mid-Term';
        if (selectedCategory === 'Board') return e.type === 'Final';
        return false;
      })
    : [];

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader 
        title={selectedCategory ? (lang === 'bn' ? categories.find(c => c.id === selectedCategory)?.titleBn! : selectedCategory) : (lang === 'bn' ? 'ফলাফল' : 'Results')} 
        onBack={selectedCategory ? () => setSelectedCategory(null) : undefined}
      />
      
      {!selectedCategory ? (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96, paddingTop: 16 }}>
            <Text style={[styles.progressTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
            {lang === 'bn' ? 'পরীক্ষার ধরণ' : 'Exam Categories'}
          </Text>
          <Text style={[styles.progressSub, { fontFamily: FF.regular }]}>
            {lang === 'bn' ? 'ক্যাটাগরি অনুযায়ী ফলাফল দেখুন এবং পরিচালনা করুন।' : 'View and manage results by category.'}
          </Text>

          <View style={styles.catList}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.catCard} activeOpacity={0.8} onPress={() => setSelectedCategory(cat.id)}>
                <View style={styles.catIconBox}>
                  <MaterialIcons name={cat.icon as any} size={22} color={Colors.textPrimary} />
                </View>
                <Text style={[styles.catTitle, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? cat.titleBn : cat.titleEn}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
          </ScrollView>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <FlatList
            data={filteredExams}
            keyExtractor={i => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 96 }}
            ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text></View>}
            renderItem={({ item }: { item: Exam }) => {
              return (
                <Card padding={16} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <Text style={[styles.examSubject, { fontFamily: FF.semiBold, flex: 1, marginBottom: 0 }]}>{item.subject}</Text>
                    <TouchableOpacity 
                      style={styles.publishBtnSmall} 
                      activeOpacity={0.8}
                      onPress={() => {
                        setForm(f => ({
                          ...f, 
                          subject: item.subject, 
                          exam_type: item.type, 
                          total_marks: String(item.marks),
                          date: item.date
                        }));
                        setModalVisible(true);
                      }}
                    >
                      <Text style={[styles.publishBtnTextSmall, { fontFamily: FF.medium }]}>
                        {lang === 'bn' ? 'ফলাফল প্রকাশ' : 'Publish result'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.examBadgeRow}>
                    <StatusBadge
                      type={typeMap[item.type] ?? 'classTest'}
                      customLabel={lang === 'bn' ? (EXAM_TYPES_BN[item.type] ?? item.type) : item.type}
                    />
                    <StatusBadge type={item.upcoming ? 'upcoming' : 'past'} />
                    <View style={styles.examMarksBadge}>
                      <MaterialIcons name="assessment" size={11} color={Colors.textSecondary} />
                      <Text style={[styles.examMarksText, { fontFamily: FF.medium }]}>
                        {lang === 'bn' ? `নম্বর: ${item.marks}` : `${item.marks} marks`}
                      </Text>
                    </View>
                  </View>

                  {item.date ? (
                    <View style={styles.examDateRow}>
                      <MaterialIcons name="event-note" size={15} color={Colors.textSecondary} />
                      <Text style={[styles.examDateText, { fontFamily: Fonts.en.medium }]}>{item.date}</Text>
                    </View>
                  ) : null}

                  {item.instructions ? (
                    <Text style={[styles.examInstr, { fontFamily: FF.regular }]} numberOfLines={2}>
                      {item.instructions}
                    </Text>
                  ) : null}
                </Card>
              );
            }}
          />


        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                  {lang === 'bn' ? 'ফলাফল প্রকাশ করুন' : 'Publish Result'}
                </Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); setProcessedResults(null); setRollInput(''); }}>
                  <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                
                {/* Meta details */}
                <View style={{ marginBottom: 16, padding: 12, backgroundColor: Colors.bgSecondary, borderRadius: Radius.md }}>
                  <Text style={{ fontFamily: FF.semiBold, color: Colors.textPrimary, fontSize: FontSize.md }}>{form.subject}</Text>
                  <Text style={{ fontFamily: FF.regular, color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 }}>
                    {form.exam_type} · {form.date} · Total Marks: {form.total_marks}
                  </Text>
                </View>

                {/* Roll & Marks Input */}
                <View style={styles.rollNote}>
                  <MaterialIcons name="content-paste" size={13} color={Colors.textMuted} />
                  <Text style={[styles.rollNoteText, { fontFamily: FF.regular }]}>
                    {lang === 'bn' ? 'রোল এবং প্রাপ্ত নম্বর পেস্ট করুন (যেমন: 842943 20)' : 'Paste roll and obtained marks (e.g., 842943 20)'}
                  </Text>
                </View>
                <TextInput
                  style={[styles.rollInput, { fontFamily: Fonts.en.regular }]}
                  value={rollInput}
                  onChangeText={setRollInput}
                  placeholder={'842943 20\n842944 18\n842946 15\n...'}
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.processBtn, !rollInput.trim() && { opacity: 0.5 }]}
                  onPress={handleProcess}
                  disabled={!rollInput.trim()}
                >
                  <Text style={[styles.processBtnText, { fontFamily: FF.semiBold }]}>
                    {lang === 'bn' ? 'প্রক্রিয়া করুন' : 'Process Marks'}
                  </Text>
                </TouchableOpacity>

                {/* Processed Table */}
                {processedResults && processedResults.length > 0 ? (
                  <View style={{ marginTop: 16, borderWidth: 1, borderColor: Colors.borderColor, borderRadius: Radius.lg, overflow: 'hidden' }}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableCell, { flex: 3, fontFamily: FF.semiBold }]}>{lang === 'bn' ? 'নাম' : 'Name'}</Text>
                      <Text style={[styles.tableCell, { flex: 2, fontFamily: Fonts.en.semiBold }]}>{lang === 'bn' ? 'রোল' : 'Roll'}</Text>
                      <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center', fontFamily: FF.semiBold }]}>{lang === 'bn' ? 'নম্বর' : 'Marks'}</Text>
                    </View>
                    {processedResults.map((s, idx) => (
                      <View key={s.student_id} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                        <Text style={[styles.tableDataCell, { flex: 3, fontFamily: FF.regular }]} numberOfLines={1}>{s.student_name}</Text>
                        <Text style={[styles.tableDataCellMuted, { flex: 2, fontFamily: Fonts.en.regular }]}>{s.student_id}</Text>
                        <Text style={[styles.tableDataCell, { flex: 1.5, textAlign: 'center', fontFamily: Fonts.en.bold, color: Colors.accent }]}>{s.marks}</Text>
                      </View>
                    ))}
                    <View style={styles.saveRow}>
                      <Text style={{ fontFamily: FF.regular, color: Colors.textSecondary, fontSize: FontSize.sm }}>
                        {processedResults.length} {lang === 'bn' ? 'টি ফলাফল' : 'results'}
                      </Text>
                      <ActionButton
                        label={lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Results'}
                        onPress={handleSave}
                        style={{ paddingHorizontal: 16 }}
                      />
                    </View>
                  </View>
                ) : null}

              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  examSubject: { fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: 8 },
  examBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  examMarksBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgSecondary, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor,
  },
  examMarksText: { fontSize: 11, color: Colors.textSecondary },
  examDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  examDateText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  examInstr: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  publishBtnSmall: {
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
  },
  publishBtnTextSmall: {
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, maxHeight: '92%', borderWidth: 1, borderColor: Colors.borderColor },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: FontSize.lg, color: Colors.textPrimary },
  rollNote: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 12, marginBottom: 8 },
  rollNoteText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  rollInput: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderColor,
    color: Colors.textPrimary, fontSize: FontSize.sm, paddingHorizontal: 14, paddingVertical: 12,
    minHeight: 130,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  processBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    paddingVertical: 12, alignItems: 'center', marginTop: 16,
  },
  processBtnText: { fontSize: FontSize.md, color: '#fff' },
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.bgSecondary, paddingHorizontal: 12, paddingVertical: 10 },
  tableCell: { fontSize: FontSize.xs, color: Colors.textMuted },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  tableRowAlt: { backgroundColor: 'rgba(240,244,240,0.6)' },
  tableDataCell: { fontSize: FontSize.xs, color: Colors.textPrimary },
  tableDataCellMuted: { fontSize: FontSize.xs, color: Colors.textSecondary },
  saveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: Colors.borderColor },
  progressTitle: { fontSize: FontSize.xl + 2, color: Colors.textPrimary, marginBottom: 4 },
  progressSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 24 },
  catList: { gap: 12 },
  catCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    padding: 16, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  catIconBox: {
    width: 40, height: 40, borderRadius: Radius.md, backgroundColor: Colors.bgSecondary,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  catTitle: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
});
