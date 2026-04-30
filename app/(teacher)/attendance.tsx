import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Switch, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { ActionButton } from '../../components/ui/ActionButton';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { SUBJECTS, ALL_STUDENTS } from '../../constants/mockData';
import { AttendanceSession, AttendanceSessionRecord } from '../../types';

type StatusType = 'present' | 'absent' | 'late';
const statusColor: Record<StatusType, string> = { present: Colors.accent, absent: Colors.danger, late: Colors.warning };

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

  const statusLabelBn: Record<StatusType, string> = { present: '✓', absent: '✗', late: 'L' };
  const statusLabelEn: Record<StatusType, string> = { present: '✓', absent: '✗', late: 'L' };
  const statusLabel = lang === 'bn' ? statusLabelBn : statusLabelEn;

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
    const order: StatusType[] = ['present', 'absent', 'late'];
    const cur = processedStudents[idx].status as StatusType;
    const next = order[(order.indexOf(cur) + 1) % 3];
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
        <View style={{ flex: 1 }}>
          <Text style={[styles.pageTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
            {lang === 'bn' ? 'উপস্থিতি ব্যবস্থাপনা' : 'Attendance Management'}
          </Text>
          <Text style={[styles.pageSubtitle, { fontFamily: FF.regular }]}>
            {lang === 'bn' ? 'রোল নম্বর পেস্ট করে দ্রুত উপস্থিতি নিন' : 'Paste roll numbers to quickly mark attendance'}
          </Text>
        </View>
        <ScreenHeader title="" showPanelSwitch />
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
              <Switch
                value={onlineAttendanceActive}
                onValueChange={setOnlineAttendanceActive}
                trackColor={{ false: Colors.bgTertiary, true: Colors.accentDim }}
                thumbColor={onlineAttendanceActive ? Colors.accent : Colors.white}
              />
            </View>
          </Card>

          {/* Subject Selector */}
          <TouchableOpacity style={styles.subjectBtn} onPress={() => setSubjectOpen(!subjectOpen)}>
            <Text style={[styles.subjectText, { fontFamily: FF.regular }, !selectedSubject && { color: Colors.textMuted }]}>
              {selectedSubject || (lang === 'bn' ? 'বিষয় নির্বাচন করুন' : 'Select Subject')}
            </Text>
            <MaterialIcons name={subjectOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          {subjectOpen ? (
            <View style={styles.dropdown}>
              {SUBJECTS.map(s => (
                <TouchableOpacity key={s} style={[styles.dropItem, selectedSubject === s && styles.dropItemActive]}
                  onPress={() => { setSelectedSubject(s); setSubjectOpen(false); }}>
                  <Text style={[styles.dropText, { fontFamily: FF.regular }, selectedSubject === s && { color: Colors.accent }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

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
            <Card padding={0}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { flex: 2, fontFamily: Fonts.en.semiBold }]}>
                  {lang === 'bn' ? 'রোল' : 'Roll'}
                </Text>
                <Text style={[styles.tableCell, { flex: 3, fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'নাম' : 'Name'}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'অবস্থা' : 'Status'}
                </Text>
              </View>
              {processedStudents.map((s, idx) => (
                <View key={s.student_id} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableDataCell, { flex: 2, fontFamily: Fonts.en.regular }]}>{s.student_id}</Text>
                  <Text style={[styles.tableDataCellMuted, { flex: 3, fontFamily: FF.regular }]} numberOfLines={1}>{s.student_name}</Text>
                  <TouchableOpacity
                    style={[styles.statusBtn, { backgroundColor: statusColor[s.status as StatusType] + '18', borderColor: statusColor[s.status as StatusType] }]}
                    onPress={() => toggleStatus(idx)}
                  >
                    <Text style={[styles.statusBtnText, { color: statusColor[s.status as StatusType], fontFamily: Fonts.en.bold }]}>
                      {statusLabel[s.status as StatusType]}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.saveRow}>
                <View style={styles.summaryBadges}>
                  <Text style={[styles.summaryBadge, { color: Colors.accent, fontFamily: FF.bold }]}>
                    ✓ {processedStudents.filter(s => s.status === 'present').length}
                  </Text>
                  <Text style={[styles.summaryBadge, { color: Colors.danger, fontFamily: FF.bold }]}>
                    ✗ {processedStudents.filter(s => s.status === 'absent').length}
                  </Text>
                  <Text style={[styles.summaryBadge, { color: Colors.warning, fontFamily: FF.bold }]}>
                    L {processedStudents.filter(s => s.status === 'late').length}
                  </Text>
                </View>
                <ActionButton
                  label={lang === 'bn' ? 'উপস্থিতি সংরক্ষণ করুন' : 'Save Attendance'}
                  onPress={handleSave}
                  style={{ paddingHorizontal: 12 }}
                />
              </View>
            </Card>
          ) : null}

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
                    <View style={styles.expandedList}>
                      {session.records.map((r, idx) => (
                        <View key={r.student_id} style={[styles.expandedRow, idx % 2 === 0 && { backgroundColor: Colors.bgSecondary }]}>
                          <Text style={[styles.expandedRoll, { fontFamily: Fonts.en.regular }]}>{r.student_id}</Text>
                          <Text style={[styles.expandedName, { fontFamily: FF.regular }]} numberOfLines={1}>{r.student_name}</Text>
                          <View style={[styles.statusBtn, { backgroundColor: statusColor[r.status as StatusType] + '18', borderColor: statusColor[r.status as StatusType] }]}>
                            <Text style={[styles.statusBtnText, { color: statusColor[r.status as StatusType], fontFamily: Fonts.en.bold }]}>{statusLabel[r.status as StatusType]}</Text>
                          </View>
                        </View>
                      ))}
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
  pageTitle: { fontSize: FontSize.xl + 2, color: Colors.textPrimary },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
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
  dropdown: { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor, overflow: 'hidden', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  dropItem: { paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
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
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  tableRowAlt: { backgroundColor: 'rgba(240,244,240,0.6)' },
  tableDataCell: { fontSize: FontSize.xs, color: Colors.textPrimary },
  tableDataCellMuted: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statusBtn: { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: 8, borderWidth: 1, minWidth: 36 },
  statusBtnText: { fontSize: FontSize.sm },
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
