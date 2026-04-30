import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';
import { useData } from '../../hooks/useData';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Colors, FontSize, Radius, Spacing, Fonts } from '../../constants/theme';

const QUICK_ACTIONS = [
  { key: 'assignments', icon: 'assignment', route: '/(teacher)/assignments', colorBg: Colors.accentLight, color: Colors.accent },
  { key: 'exams', icon: 'school', route: '/(teacher)/exams', colorBg: '#EFF6FF', color: Colors.info },
  { key: 'attendance', icon: 'people', route: '/(teacher)/attendance', colorBg: Colors.accentLight, color: Colors.accent },
  { key: 'notices', icon: 'campaign', route: '/(teacher)/notices', colorBg: '#FEF3C7', color: Colors.warning },
];

const actionLabelBn: Record<string, string> = {
  assignments: 'অ্যাসাইনমেন্ট',
  exams: 'পরীক্ষা',
  attendance: 'উপস্থিতি',
  notices: 'বিজ্ঞপ্তি',
};
const actionLabelEn: Record<string, string> = {
  assignments: 'Assignments',
  exams: 'Exams',
  attendance: 'Attendance',
  notices: 'Notices',
};

export default function TeacherDashboard() {
  const { user, logout, setPanelMode, panelMode } = useAuth();
  const { lang, tr, toggleLang } = useLang();
  const { assignments, exams, results, auditLog, notices } = useData();
  const router = useRouter();

  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const upcomingExams = exams.filter(e => e.upcoming).length;
  const totalResults = results.length;
  const topNotice = notices[0];

  const panelLabel = lang === 'bn' ? 'শিক্ষক প্যানেল' : 'Teacher Panel';
  const roleLabel = user?.role === 'cr'
    ? (lang === 'bn' ? 'ক্লাস রিপ্রেজেন্টেটিভ' : 'Class Representative')
    : (lang === 'bn' ? 'শিক্ষক' : 'Teacher');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header matching reference */}
        <View style={styles.headerArea}>
          <View style={styles.headerLeft}>
            <Text style={[styles.panelLabel, { fontFamily: FF.regular }]}>{panelLabel}</Text>
            <Text style={[styles.userName, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
              {user?.name?.toUpperCase() ?? 'ADMIN'}
            </Text>
            <Text style={[styles.roleLabel, { fontFamily: FF.regular }]}>{roleLabel}</Text>
          </View>
          <View style={styles.headerRight}>
            {user?.role === 'cr' ? (
              <TouchableOpacity
                style={styles.iconBtnActive}
                onPress={() => { setPanelMode('student'); router.replace('/(student)'); }}
                activeOpacity={0.75}
              >
                <MaterialIcons name="grid-view" size={20} color={Colors.accent} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.iconBtn}>
              <MaterialIcons name="notifications-off" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.langBtn} onPress={toggleLang} activeOpacity={0.75}>
              <MaterialIcons name="translate" size={13} color={Colors.accent} />
              <Text style={[styles.langText, { fontFamily: Fonts.en.semiBold }]}>
                {lang === 'bn' ? 'EN' : 'বাং'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={logout} activeOpacity={0.75}>
              <MaterialIcons name="logout" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.pad}>
          {/* Latest Notice */}
          {topNotice ? (
            <Card padding={14}>
              <View style={styles.noticeHeader}>
                <View style={styles.noticeHeaderLeft}>
                  <MaterialIcons name="notifications-none" size={16} color={Colors.accent} />
                  <Text style={[styles.noticeSectionTitle, { fontFamily: FF.semiBold }]}>{tr('notices')}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(teacher)/notices')}>
                  <Text style={[styles.seeAll, { fontFamily: FF.semiBold }]}>{tr('seeAll')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.noticeItem}>
                {topNotice.important ? <View style={styles.redDot} /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.noticeTitle, { fontFamily: FF.semiBold }]}>{topNotice.title}</Text>
                  <Text style={[styles.noticeDesc, { fontFamily: FF.regular }]} numberOfLines={2}>{topNotice.description}</Text>
                  <Text style={[styles.noticeMeta, { fontFamily: Fonts.en.regular }]}>{topNotice.date} · {topNotice.time} · {topNotice.author}</Text>
                </View>
              </View>
              <View style={styles.dotRow}>
                {[0,1,2,3].map(i => <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />)}
              </View>
            </Card>
          ) : null}

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
            {lang === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions'}
          </Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.key}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.colorBg }]}>
                  <MaterialIcons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? actionLabelBn[action.key] : actionLabelEn[action.key]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Overview */}
          <Text style={[styles.sectionTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
            {lang === 'bn' ? 'সারসংক্ষেপ' : 'Overview'}
          </Text>
          {[
            { labelBn: 'সক্রিয় অ্যাসাইনমেন্ট', labelEn: 'Active Assignments', count: activeAssignments, icon: 'assignment', colorBg: Colors.accentLight, color: Colors.accent },
            { labelBn: 'আসন্ন পরীক্ষা', labelEn: 'Upcoming Exams', count: upcomingExams, icon: 'school', colorBg: '#EFF6FF', color: Colors.info },
            { labelBn: 'ফলাফল আপলোড', labelEn: 'Results Uploaded', count: totalResults, icon: 'bar-chart', colorBg: '#FEF3C7', color: Colors.warning },
          ].map(item => (
            <Card key={item.labelEn} padding={16}>
              <View style={styles.overviewRow}>
                <View style={[styles.overviewIcon, { backgroundColor: item.colorBg }]}>
                  <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={[styles.overviewLabel, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? item.labelBn : item.labelEn}
                </Text>
                <Text style={[styles.overviewCount, { fontFamily: Fonts.en.bold, color: item.color }]}>{item.count}</Text>
              </View>
            </Card>
          ))}

          {/* Audit Log */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
              {lang === 'bn' ? 'সাম্প্রতিক কার্যকলাপ' : 'Recent Activity'}
            </Text>
            <MaterialIcons name="show-chart" size={16} color={Colors.textMuted} />
          </View>
          {auditLog.slice(0, 5).map(log => (
            <Card key={log.id} padding={14}>
              <View style={styles.logRow}>
                <View style={styles.logIcon}>
                  <MaterialIcons name="access-time" size={16} color={Colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.logAction, { fontFamily: Fonts.en.semiBold }]}>{log.action}</Text>
                  <Text style={[styles.logDetails, { fontFamily: FF.regular }]} numberOfLines={1}>{log.details}</Text>
                  <Text style={[styles.logMeta, { fontFamily: Fonts.en.regular }]}>
                    {log.performed_by} · {new Date(log.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  headerArea: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
  },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  userName: { fontSize: FontSize.xl + 2, color: Colors.textPrimary, marginTop: 2 },
  roleLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  iconBtnActive: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.accent,
  },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, height: 38, borderRadius: 19,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  langText: { fontSize: FontSize.xs, color: Colors.accent },
  pad: { paddingHorizontal: 16 },
  noticeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  noticeHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noticeSectionTitle: { fontSize: FontSize.md, color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.accent },
  noticeItem: { flexDirection: 'row', gap: 10 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, marginTop: 4 },
  noticeTitle: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 2 },
  noticeDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  noticeMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  dotRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 4, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.borderColor },
  dotActive: { backgroundColor: Colors.accent, width: 14 },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: 12, marginTop: 4 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
  actionCard: {
    width: '47%', backgroundColor: Colors.card,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.borderColor,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: FontSize.md, color: Colors.textPrimary, flex: 1 },
  overviewRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  overviewIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  overviewLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  overviewCount: { fontSize: FontSize.xl + 2 },
  logRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  logIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.bgSecondary, justifyContent: 'center', alignItems: 'center' },
  logAction: { fontSize: FontSize.sm, color: Colors.textPrimary },
  logDetails: { fontSize: FontSize.xs, color: Colors.accent, marginTop: 1 },
  logMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
});
