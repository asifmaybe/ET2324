import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { ActionButton } from '../../components/ui/ActionButton';
import { ModernSwitch } from '../../components/ui/ModernSwitch';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { SUBJECTS, ALL_STUDENTS } from '../../constants/mockData';
import { AttendanceSession, AttendanceSessionRecord } from '../../types';

type StatusType = 'present' | 'absent';
const statusColor: Record<StatusType, string> = { present: Colors.accent, absent: Colors.danger };

export default function TeacherAttendance() {
  const { user } = useAuth();
  const { onlineAttendanceActive, setOnlineAttendanceActive, attendanceSessions, addAttendanceSession } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [rollInput, setRollInput] = useState('');
  const [processedStudents, setProcessedStudents] = useState<AttendanceSessionRecord[] | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);



  const handleProcess = () => {
    if (!selectedSubject) return;
    const presentRolls = rollInput.split('\n').map(r => r.trim()).filter(Boolean);
    const records: AttendanceSessionRecord[] = ALL_STUDENTS.map(s => ({
      student_id: s.roll_number,
      student_name: s.name,
      status: (presentRolls.includes(s.roll_number) ? 'present' : 'absent') as StatusType,
    })).sort((a, b) => a.student_id.localeCompare(b.student_id));
    setProcessedStudents(records);
  };

  const toggleStatus = (idx: number) => {
    if (!processedStudents) return;
    const cur = processedStudents[idx].status as StatusType;
    const next = cur === 'present' ? 'absent' : 'present';
    const updated = [...processedStudents];
    updated[idx] = { ...updated[idx], status: next };
    setProcessedStudents(updated);
  };

  const handleSave = () => {
    if (!processedStudents || !selectedSubject) return;
    const now = new Date();
    const session: AttendanceSession = {
      id: '',
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject,
      is_online_marking_active: onlineAttendanceActive,
      marked_by: user?.name ?? '',
      created_at: now.toISOString(),
      records: processedStudents,
    };
    addAttendanceSession(session);
    setProcessedStudents(null);
    setRollInput('');
    setSelectedSubject('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.titleArea}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={[styles.pageTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {lang === 'bn' ? 'উপস্থিতি ব্যবস্থাপনা' : 'Attendance Management'}
          </Text>
          <Text style={[styles.pageSubtitle, { fontFamily: FF.regular }]}>
            {lang === 'bn' ? 'রোল নম্বর পেস্ট করে দ্রুত উপস্থিতি নিন' : 'Paste roll numbers to quickly mark attendance'}
          </Text>
        </View>
        <ScreenHeader title="" />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Online Attendance Toggle */}
          <Card padding={16}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={[styles.toggleTitle, { fontFamily: FF.semiBold }]}>{tr('onlineAttendance')}</Text>
                <Text style={[styles.toggleSub, { fontFamily: FF.regular, color: onlineAttendanceActive ? Colors.accent : Colors.textSecondary }]}>
                  {onlineAttendanceActive
                    ? (lang === 'bn' ? 'সক্রিয় — এখন উপস্থিতি নিন' : 'Active — taking attendance now')
                    : (lang === 'bn' ? 'নিষ্ক্রিয় — অফলাইনে পরিচালিত' : 'Inactive — handled offline')}
                </Text>
              </View>
              <ModernSwitch
                value={onlineAttendanceActive}
                onValueChange={(v) => { setOnlineAttendanceActive(v); if (!v) setSelectedSubject(''); }}
              />
            </View>
          </Card>

          {onlineAttendanceActive && (
            <>
              {/* Subject Selector */}
              <TouchableOpacity style={styles.subjectBtn} onPress={() => setSubjectOpen(true)}>
                <Text style={[styles.subjectText, { fontFamily: FF.regular }, !selectedSubject && { color: Colors.textMuted }]}>
                  {selectedSubject || (lang === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Select Subject')}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              {/* Floating Subject Picker Modal */}
              <Modal visible={subjectOpen} transparent animationType="fade" onRequestClose={() => setSubjectOpen(false)}>
                <Pressable style={styles.dropdownOverlay} onPress={() => setSubjectOpen(false)}>
                  <View style={styles.dropdownModal}>
                    {/* Default "Select Subject" option */}
                    <TouchableOpacity style={styles.dropItem}
                      onPress={() => { setSelectedSubject(''); setSubjectOpen(false); }}>
                      <Text style={[styles.dropText, { fontFamily: FF.regular, color: Colors.textMuted }]}>
                        {lang === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Select Subject'}
                      </Text>
                    </TouchableOpacity>
                    {SUBJECTS.map(s => (
                      <TouchableOpacity key={s} style={[styles.dropItem, selectedSubject === s && styles.dropItemActive]}
                        onPress={() => { setSelectedSubject(s); setSubjectOpen(false); }}>
                        <Text style={[styles.dropText, { fontFamily: FF.regular }, selectedSubject === s && { color: Colors.accent }]}>{s}</Text>
                        {selectedSubject === s && <MaterialIcons name="check" size={18} color={Colors.accent} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>

              {/* Roll Number Paste Area */}
              <View style={styles.rollNote}>
                <MaterialIcons name="content-paste" size={13} color={Colors.textMuted} />
                <Text style={[styles.rollNoteText, { fontFamily: FF.regular }]}>
                  {lang === 'bn' ? 'উপস্থিত শিক্ষার্থীদের রোল নম্বর পেস্ট করুন (প্রতি লাইনে একটি)' : 'Paste present students roll numbers (one per line)'}
                </Text>
              </View>
              <TextInput
                style={[styles.rollInput, { fontFamily: Fonts.en.regular }]}
                value={rollInput}
                onChangeText={setRollInput}
                placeholder={'842943\n842944\n842946\n...'}
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={[styles.presentNote, { fontFamily: FF.regular }]}>
                {lang === 'bn' ? 'যাদের রোল নম্বর দেবেন তারা উপস্থিত, বাকিরা অনুপস্থিত হিসেবে চিহ্নিত হবে' : 'Rolls entered will be marked Present; others Absent'}
              </Text>
              <TouchableOpacity
                style={[styles.processBtn, !selectedSubject && { opacity: 0.5 }]}
                onPress={handleProcess}
                disabled={!selectedSubject}
              >
                <Text style={[styles.processBtnText, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'উপস্থিতি প্রক্রিয়া করুন' : 'Process Attendance'}
                </Text>
              </TouchableOpacity>

              {/* Processed Table */}
              {processedStudents ? (
                <View style={{ marginTop: 16, borderWidth: 1, borderColor: Colors.borderColor, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.white }}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, { flex: 3, fontFamily: FF.semiBold }]}>{lang === 'bn' ? 'নাম' : 'Name'}</Text>
                    <Text style={[styles.tableCell, { flex: 2, fontFamily: Fonts.en.semiBold }]}>{lang === 'bn' ? 'রোল' : 'Roll'}</Text>
                    <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center', fontFamily: FF.semiBold }]}>{lang === 'bn' ? 'অবস্থা' : 'Status'}</Text>
                  </View>
                  <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled={true}>
                    {processedStudents.map((s, idx) => (
                      <View key={s.student_id} style={[styles.tableRowBordered, s.status === 'absent' && { backgroundColor: Colors.danger + '0D' }]}>
                        <Text style={[styles.tableDataCell, { flex: 3, fontFamily: FF.regular }]} numberOfLines={1}>{s.student_name}</Text>
                        <Text style={[styles.tableDataCellMuted, { flex: 2, fontFamily: Fonts.en.regular }]}>{s.student_id}</Text>
                        <TouchableOpacity
                          style={[styles.statusBtnClean, { flex: 1.5 }]}
                          onPress={() => toggleStatus(idx)}
                        >
                          <MaterialIcons name={s.status === 'present' ? 'check' : 'close'} size={20} color={statusColor[s.status as StatusType]} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.saveRow}>
                    <View style={styles.summaryBadges}>
                      <Text style={[styles.summaryBadge, { color: Colors.accent, fontFamily: FF.bold }]}>
                        ✓ {processedStudents.filter(s => s.status === 'present').length}
                      </Text>
                      <Text style={[styles.summaryBadge, { color: Colors.danger, fontFamily: FF.bold }]}>
                        ✗ {processedStudents.filter(s => s.status === 'absent').length}
                      </Text>
                    </View>
                    <ActionButton
                      label={lang === 'bn' ? 'উপস্থিতি সংরক্ষণ করুন' : 'Save Attendance'}
                      onPress={handleSave}
                      style={{ paddingHorizontal: 12 }}
                    />
                  </View>
                </View>
              ) : null}
            </>
          )}

          {/* Previous Sessions */}
          {attendanceSessions.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                {lang === 'bn' ? 'আগের সেশন' : 'Previous Sessions'}
              </Text>
              <Text style={[styles.sectionSubtitle, { fontFamily: FF.regular }]}>
                {lang === 'bn' ? 'বিস্তারিত দেখতে ক্লিক করুন' : 'Click a session to view details'}
              </Text>
              {attendanceSessions.map(session => (
                <Card key={session.id} padding={16}>
                  <TouchableOpacity style={styles.sessionHeader}
                    onPress={() => setExpandedSession(expandedSession === session.id ? null : session.id)}>
                    <View style={[styles.sessionIcon, { backgroundColor: Colors.accentLight }]}>
                      <MaterialIcons name="people" size={18} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sessionSubject, { fontFamily: FF.semiBold }]} numberOfLines={1}>{session.subject}</Text>
                      <Text style={[styles.sessionMeta, { fontFamily: Fonts.en.regular }]}>
                        {session.records.filter(r => r.status === 'present').length}/{session.records.length}{' '}
                        {lang === 'bn' ? 'উপস্থিত' : 'present'} · {session.records.filter(r => r.status === 'absent').length}{' '}
                        {lang === 'bn' ? 'অনুপস্থিত' : 'absent'} · {session.marked_by} · {new Date(session.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <MaterialIcons name={expandedSession === session.id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                  {expandedSession === session.id ? (
                    <View style={{ marginTop: 16, borderWidth: 1, borderColor: Colors.borderColor, borderRadius: Radius.lg, overflow: 'hidden' }}>
                      <View style={[styles.tableHeader, { backgroundColor: Colors.bgSecondary }]}>
                        <Text style={[styles.tableCell, { flex: 3, fontFamily: FF.semiBold }]}>{lang === 'bn' ? 'নাম' : 'Name'}</Text>
                        <Text style={[styles.tableCell, { flex: 2, fontFamily: Fonts.en.semiBold }]}>{lang === 'bn' ? 'রোল' : 'Roll'}</Text>
                        <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center', fontFamily: FF.semiBold }]}>{lang === 'bn' ? 'অবস্থা' : 'Status'}</Text>
                      </View>
                      <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled={true}>
                        {session.records.map((r, idx) => (
                          <View key={r.student_id} style={[styles.tableRowBordered, r.status === 'absent' && { backgroundColor: Colors.danger + '0D' }]}>
                            <Text style={[styles.tableDataCell, { flex: 3, fontFamily: FF.regular }]} numberOfLines={1}>{r.student_name}</Text>
                            <Text style={[styles.tableDataCellMuted, { flex: 2, fontFamily: Fonts.en.regular }]}>{r.student_id}</Text>
                            <View style={[styles.statusBtnClean, { flex: 1.5 }]}>
                              <MaterialIcons name={r.status === 'present' ? 'check' : 'close'} size={20} color={statusColor[r.status as StatusType]} />
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  ) : null}
                </Card>
              ))}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  titleArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  pageTitle: { fontSize: FontSize.lg, color: Colors.textPrimary },
  pageSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  content: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleTitle: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 2 },
  toggleSub: { fontSize: FontSize.xs },
  subjectBtn: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderColor,
    paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  subjectText: { fontSize: FontSize.md, color: Colors.textPrimary, flex: 1 },
  dropdownOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  dropdownModal: {
    backgroundColor: Colors.white, borderRadius: Radius.xl, width: '100%',
    paddingVertical: 16, paddingHorizontal: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  dropdownTitle: { fontSize: FontSize.md, color: Colors.textPrimary, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
  dropItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropItemActive: { backgroundColor: Colors.accentLight },
  dropText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  rollNote: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: 12, marginBottom: 8 },
  rollNoteText: { fontSize: FontSize.xs, color: Colors.textMuted, flex: 1, lineHeight: 18 },
  rollInput: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderColor,
    color: Colors.textPrimary, fontSize: FontSize.sm, paddingHorizontal: 14, paddingVertical: 12,
    minHeight: 130,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  presentNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6, marginBottom: 14, lineHeight: 18 },
  processBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    paddingVertical: 15, alignItems: 'center', marginBottom: 16,
  },
  processBtnText: { fontSize: FontSize.md, color: '#fff' },
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.bgSecondary, paddingHorizontal: 12, paddingVertical: 10, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  tableCell: { fontSize: FontSize.xs, color: Colors.textMuted },
  tableRowBordered: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
  tableDataCell: { fontSize: FontSize.xs, color: Colors.textPrimary },
  tableDataCellMuted: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusBtnClean: { alignItems: 'center', paddingVertical: 4 },
  saveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderTopWidth: 1, borderTopColor: Colors.borderColor },
  summaryBadges: { flexDirection: 'row', gap: 12 },
  summaryBadge: { fontSize: FontSize.md },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, marginTop: 20, marginBottom: 4 },
  sectionSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 12 },
  sessionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sessionSubject: { fontSize: FontSize.md, color: Colors.textPrimary },
  sessionMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  expandedList: { marginTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderColor, paddingTop: 10 },
  expandedRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 8, gap: 8, borderRadius: 6 },
  expandedRoll: { width: 64, fontSize: FontSize.xs, color: Colors.textSecondary },
  expandedName: { flex: 1, fontSize: FontSize.xs, color: Colors.textPrimary },
});
