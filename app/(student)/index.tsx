import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';
import { useData } from '../../hooks/useData';
import { Card } from '../../components/ui/Card';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MOCK_ROUTINE } from '../../constants/mockData';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_BN: Record<string, string> = {
  Sunday: 'রবিবার',
  Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার',
  Wednesday: 'বুধবার',
  Thursday: 'বৃহস্পতিবার',
};

function getNextSession() {
  const now = new Date();
  const bstNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const dayName = DAYS[bstNow.getDay()];
  const currentH = bstNow.getHours();
  const currentM = bstNow.getMinutes();
  const totalMins = currentH * 60 + currentM;

  const todaysClasses = MOCK_ROUTINE
    .filter(r => r.day === dayName)
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const cls of todaysClasses) {
    const parts = cls.time_slot.split(' - ');
    const [sH, sM] = parts[0].split(':').map(Number);
    const [eH, eM] = (parts[1] ?? parts[0]).split(':').map(Number);
    const startMins = sH * 60 + (sM || 0);
    const endMins = eH * 60 + (eM || 0);
    if (totalMins >= startMins && totalMins < endMins) return { cls, status: 'now' };
    if (totalMins < startMins && startMins - totalMins <= 30) return { cls, status: 'soon' };
    if (totalMins < startMins) return { cls, status: 'next' };
  }
  const workingDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const todayIdx = workingDays.indexOf(dayName);
  const nextDayName = workingDays[(todayIdx + 1) % workingDays.length];
  const nextCls = MOCK_ROUTINE
    .filter(r => r.day === nextDayName)
    .sort((a, b) => a.sort_order - b.sort_order)[0];
  return nextCls ? { cls: nextCls, status: 'tomorrow' } : null;
}

export default function StudentDashboard() {
  const { user, logout, setPanelMode } = useAuth();
  const { lang, toggleLang, tr } = useLang();
  const { assignments, exams, notices } = useData();
  const router = useRouter();

  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const pendingCount = assignments.filter(a => a.status === 'active' || a.status === 'pending').length;
  const upcomingExams = exams.filter(e => e.upcoming).length;
  const attendancePct = user?.attendance_percent ?? 0;
  const nextSess = getNextSession();
  const topNotice = notices[0];

  const statusLabelBn: Record<string, string> = {
    now: 'এখন চলছে',
    soon: 'শীঘ্রই শুরু',
    next: 'পরবর্তী ক্লাস',
    tomorrow: 'আগামীকাল শুরু',
  };
  const statusLabelEn: Record<string, string> = {
    now: 'Happening Now',
    soon: 'Happening Soon',
    next: 'Next Class',
    tomorrow: 'Resumes Tomorrow',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <View style={styles.headerArea}>
          <View style={styles.headerLeft}>
            <Text style={[styles.welcomeSmall, { fontFamily: FF.regular }]}>
              {lang === 'bn' ? 'স্বাগতম,' : 'Welcome,'}
            </Text>
            <Text style={[styles.userName, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
              {(user?.name ?? 'STUDENT').toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerBtns}>
            {/* CR Panel Toggle */}
            {user?.role === 'cr' ? (
              <TouchableOpacity
                style={styles.iconBtnActive}
                onPress={() => { setPanelMode('teacher'); router.replace('/(teacher)'); }}
                activeOpacity={0.75}
              >
                <MaterialIcons name="grid-view" size={19} color={Colors.accent} />
              </TouchableOpacity>
            ) : null}
            {/* Bell */}
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.75}>
              <MaterialIcons name="notifications-off" size={19} color={Colors.textSecondary} />
            </TouchableOpacity>
            {/* Lang */}
            <TouchableOpacity style={styles.langBtn} onPress={toggleLang} activeOpacity={0.75}>
              <MaterialIcons name="translate" size={12} color={Colors.accent} />
              <Text style={[styles.langBtnText, { fontFamily: Fonts.en.semiBold }]}>
                {lang === 'bn' ? 'EN' : 'বাং'}
              </Text>
            </TouchableOpacity>
            {/* Logout */}
            <TouchableOpacity style={styles.iconBtn} onPress={logout} activeOpacity={0.75}>
              <MaterialIcons name="logout" size={19} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pad}>

          {/* ── Notice Card ── */}
          {topNotice ? (
            <Card padding={16}>
              <View style={styles.noticeTopRow}>
                <View style={styles.noticeTitleRow}>
                  <MaterialIcons name="notifications-none" size={16} color={Colors.accent} />
                  <Text style={[styles.noticeSectionLabel, { fontFamily: FF.semiBold }]}>
                    {lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notice'}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Text style={[styles.seeAllText, { fontFamily: FF.semiBold }]}>
                    {lang === 'bn' ? 'সব দেখুন' : 'See all'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.noticeBody}>
                {topNotice.important ? <View style={styles.redDot} /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.noticeTitle, { fontFamily: FF.semiBold }]}>
                    {topNotice.title}
                  </Text>
                  <Text style={[styles.noticeDesc, { fontFamily: FF.regular }]} numberOfLines={2}>
                    {topNotice.description}
                  </Text>
                  <Text style={[styles.noticeMeta, { fontFamily: Fonts.en.regular }]}>
                    {topNotice.date} · {topNotice.time} · {topNotice.author}
                  </Text>
                </View>
              </View>
              <View style={styles.dotRow}>
                {[0, 1, 2, 3].map(i => (
                  <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
                ))}
              </View>
            </Card>
          ) : null}

          {/* ── Section: সারসংক্ষেপ ── */}
          <Text style={[styles.sectionTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
            {lang === 'bn' ? 'সারসংক্ষেপ' : 'Summary'}
          </Text>

          {/* Pending Assignments */}
          <Card padding={16}>
            <View style={styles.statRow}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accentLight }]}>
                <MaterialIcons name="assignment" size={22} color={Colors.accent} />
              </View>
              <View style={styles.statText}>
                <Text style={[styles.statLabel, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'বাকি অ্যাসাইনমেন্ট' : 'Pending Assignments'}
                </Text>
                <Text style={[styles.statSub, { fontFamily: FF.regular }]}>
                  {pendingCount === 1
                    ? (lang === 'bn' ? `${pendingCount}টি কাজ জমা দিতে হবে` : `${pendingCount} task to submit`)
                    : (lang === 'bn' ? `${pendingCount}টি কাজ জমা দিতে হবে` : `${pendingCount} tasks to submit`)}
                </Text>
              </View>
              <Text style={[styles.statCount, { fontFamily: Fonts.en.bold, color: Colors.accent }]}>
                {pendingCount}
              </Text>
            </View>
          </Card>

          {/* Upcoming Exams */}
          <Card padding={16}>
            <View style={styles.statRow}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accentLight }]}>
                <MaterialIcons name="calendar-today" size={22} color={Colors.accent} />
              </View>
              <View style={styles.statText}>
                <Text style={[styles.statLabel, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'আসন্ন পরীক্ষা' : 'Upcoming Exams'}
                </Text>
                <Text style={[styles.statSub, { fontFamily: FF.regular }]}>
                  {lang === 'bn'
                    ? `${upcomingExams}টি এই মাসে নির্ধারিত`
                    : `${upcomingExams} scheduled this month`}
                </Text>
              </View>
              <Text style={[styles.statCount, { fontFamily: Fonts.en.bold, color: Colors.accent }]}>
                {upcomingExams}
              </Text>
            </View>
          </Card>

          {/* Monthly Attendance */}
          <Card padding={16}>
            <View style={styles.statRow}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accentLight }]}>
                <MaterialIcons name="person-outline" size={22} color={Colors.accent} />
              </View>
              <View style={[styles.statText, { flex: 1 }]}>
                <Text style={[styles.statLabel, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'মাসিক উপস্থিতি' : 'Monthly Attendance'}
                </Text>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, {
                    width: `${Math.max(attendancePct, 0)}%` as any,
                    backgroundColor: attendancePct >= 75 ? Colors.accent : Colors.danger,
                  }]} />
                </View>
                <Text style={[styles.statSub, { fontFamily: FF.regular }]}>
                  {lang === 'bn' ? '০/০ দিন উপস্থিত' : '0/0 days present'}
                </Text>
              </View>
              <Text style={[styles.statCount, { fontFamily: Fonts.en.bold, color: Colors.accent }]}>
                {attendancePct}%
              </Text>
            </View>
          </Card>

          {/* ── Section: পরবতী সেশন ── */}
          <View style={styles.nextSessionHeader}>
            <Text style={[styles.sectionTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold, marginBottom: 0 }]}>
              {lang === 'bn' ? 'পরবতী সেশন' : 'Next Session'}
            </Text>
            <TouchableOpacity
              style={styles.routineBtn}
              onPress={() => router.push('/(student)/routine')}
              activeOpacity={0.75}
            >
              <MaterialIcons name="calendar-today" size={13} color={Colors.textSecondary} />
              <Text style={[styles.routineBtnText, { fontFamily: FF.regular }]}>
                {lang === 'bn' ? 'রুটিন দেখুন' : 'View Routine'}
              </Text>
            </TouchableOpacity>
          </View>

          {nextSess ? (
            <View style={[
              styles.sessionCard,
              { backgroundColor: nextSess.status === 'now' ? Colors.danger : Colors.accent },
            ]}>
              {/* status label row */}
              <View style={styles.sessionTopRow}>
                <Text style={[styles.sessionStatusText, { fontFamily: FF.regular }]}>
                  {lang === 'bn'
                    ? statusLabelBn[nextSess.status]
                    : statusLabelEn[nextSess.status]}
                </Text>
                {nextSess.status === 'now' ? (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.liveText, { fontFamily: Fonts.en.semiBold }]}>LIVE</Text>
                  </View>
                ) : null}
              </View>

              {/* Subject */}
              <Text
                style={[styles.sessionSubject, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}
                numberOfLines={2}
              >
                {nextSess.cls.subject}
              </Text>

              {/* Hall — Teacher */}
              <Text style={[styles.sessionTeacher, { fontFamily: FF.regular }]}>
                {nextSess.cls.hall} — {nextSess.cls.teacher}
              </Text>

              {/* Meta row: time | hall | day */}
              <View style={styles.sessionMetaRow}>
                <MaterialIcons name="access-time" size={14} color="rgba(255,255,255,0.85)" />
                <Text style={[styles.sessionMetaText, { fontFamily: Fonts.en.regular }]}>
                  {nextSess.cls.time_slot.split(' - ')[0]}
                </Text>
                <MaterialIcons name="location-on" size={14} color="rgba(255,255,255,0.85)" style={{ marginLeft: 14 }} />
                <Text style={[styles.sessionMetaText, { fontFamily: Fonts.en.regular }]}>
                  {nextSess.cls.hall}
                </Text>
                <MaterialIcons name="event" size={14} color="rgba(255,255,255,0.85)" style={{ marginLeft: 14 }} />
                <Text style={[styles.sessionMetaText, { fontFamily: lang === 'bn' ? Fonts.bn.regular : Fonts.en.regular }]}>
                  {lang === 'bn' ? (DAYS_BN[nextSess.cls.day] ?? nextSess.cls.day) : nextSess.cls.day}
                </Text>
              </View>
            </View>
          ) : (
            <Card padding={20}>
              <Text style={[styles.noSession, { fontFamily: FF.regular }]}>
                {lang === 'bn' ? 'আজ কোনো ক্লাস নেই' : 'No class scheduled today'}
              </Text>
            </Card>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingBottom: 28 },

  /* Header */
  headerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerLeft: { flex: 1 },
  welcomeSmall: { fontSize: FontSize.sm, color: Colors.textSecondary },
  userName: { fontSize: FontSize.xl + 4, color: Colors.textPrimary, marginTop: 1, letterSpacing: -0.3 },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.borderColor,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  iconBtnActive: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.accentLight,
    borderWidth: 1.5, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, height: 38, borderRadius: 19,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.borderColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  langBtnText: { fontSize: FontSize.xs, color: Colors.accent },

  pad: { paddingHorizontal: 16 },

  /* Notice */
  noticeTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  noticeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noticeSectionLabel: { fontSize: FontSize.md, color: Colors.accent },
  seeAllText: { fontSize: FontSize.sm, color: Colors.accent },
  noticeBody: { flexDirection: 'row', gap: 10 },
  redDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.danger, marginTop: 5 },
  noticeTitle: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 3 },
  noticeDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 5 },
  noticeMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  dotRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 4, marginTop: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.borderColor },
  dotActive: { backgroundColor: Colors.accent, width: 14 },

  /* Section title */
  sectionTitle: {
    fontSize: FontSize.lg + 1, color: Colors.textPrimary,
    marginTop: 4, marginBottom: 12,
  },

  /* Stat cards */
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statIcon: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center',
  },
  statText: { flex: 1 },
  statLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
  statSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statCount: { fontSize: FontSize.xl + 4 },

  /* Attendance progress */
  progressBg: {
    height: 5, backgroundColor: Colors.bgTertiary,
    borderRadius: 3, overflow: 'hidden',
    marginTop: 6, marginBottom: 4,
  },
  progressFill: { height: 5, borderRadius: 3 },

  /* Next session header row */
  nextSessionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 4, marginBottom: 12,
  },
  routineBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.white, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.borderColor,
  },
  routineBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary },

  /* Session card */
  sessionCard: {
    borderRadius: Radius.xl, padding: 18, marginBottom: 16,
  },
  sessionTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  sessionStatusText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { fontSize: FontSize.xs, color: '#fff' },
  sessionSubject: {
    fontSize: FontSize.xl, color: '#FFFFFF',
    marginBottom: 6, lineHeight: 30,
  },
  sessionTeacher: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.80)',
    marginBottom: 12,
  },
  sessionMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sessionMetaText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.90)' },

  noSession: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
});
