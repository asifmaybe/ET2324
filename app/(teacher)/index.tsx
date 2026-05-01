import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';
import { HamburgerMenu } from '../../components/ui/HamburgerMenu';
import { useData } from '../../hooks/useData';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { NoticeModal } from '../../components/ui/NoticeModal';
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
  const { user, setPanelMode, panelMode } = useAuth();
  const { lang, tr } = useLang();
  const { assignments, exams, results, auditLog, notices } = useData();
  const router = useRouter();

  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const activeAssignments = assignments.filter(a => a.status === 'active').length;
  const upcomingExams = exams.filter(e => e.upcoming).length;
  const totalResults = results.length;
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const displayNotices = notices.slice(0, 4);
  const currentNotice = displayNotices[currentNoticeIndex];

  const handleNextNotice = () => {
    if (currentNoticeIndex < displayNotices.length - 1) {
      setCurrentNoticeIndex(prev => prev + 1);
    }
  };

  const handlePrevNotice = () => {
    if (currentNoticeIndex > 0) {
      setCurrentNoticeIndex(prev => prev - 1);
    }
  };

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
            <HamburgerMenu />
          </View>
        </View>

        <View style={styles.pad}>
          {/* Latest Notice */}
          {currentNotice ? (
            <View style={{ marginBottom: 24 }}>
              <View style={styles.noticeSectionHeader}>
                <Text style={[styles.noticeMainTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                  {lang === 'bn' ? 'বিশেষ বিজ্ঞপ্তি' : 'Special Notice'}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(teacher)/notices')}>
                  <Text style={[styles.seeAllGreen, { fontFamily: FF.semiBold }]}>
                    {lang === 'bn' ? 'সব দেখুন' : 'See all'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Card padding={16}>
                <View style={styles.noticeCardTop}>
                  <View style={styles.noticeBadge}>
                    <Text style={[styles.noticeBadgeText, { fontFamily: FF.medium }]}>
                      {lang === 'bn' ? 'একাডেমিক' : 'Academic'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.detailsBtn} onPress={() => setSelectedNotice(currentNotice)}>
                    <MaterialIcons name="visibility" size={16} color={Colors.textSecondary} />
                    <Text style={[styles.detailsText, { fontFamily: FF.regular }]}>
                      {lang === 'bn' ? 'বিস্তারিত দেখুন' : 'See details'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.noticeTitleLg, { fontFamily: FF.bold }]} numberOfLines={2}>
                  {currentNotice.title}
                </Text>
                <Text style={[styles.noticeDescLg, { fontFamily: FF.regular }]} numberOfLines={3}>
                  {currentNotice.description}
                </Text>

                <View style={styles.noticeDivider} />

                <View style={styles.noticeBottomRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.noticeAuthor, { fontFamily: Fonts.en.medium }]}>
                      {currentNotice.author || 'Dr. Ariful Islam'}
                    </Text>
                    <Text style={[styles.noticeDateTime, { fontFamily: FF.regular }]}>
                      {currentNotice.date} • {currentNotice.time}
                    </Text>
                  </View>
                  
                  <View style={styles.noticePagination}>
                    <TouchableOpacity 
                      style={[styles.pageBtn, currentNoticeIndex === 0 && { opacity: 0.5 }]} 
                      onPress={handlePrevNotice}
                      disabled={currentNoticeIndex === 0}
                    >
                      <MaterialIcons name="chevron-left" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.pageBtnRight, currentNoticeIndex === displayNotices.length - 1 && { opacity: 0.5 }]} 
                      onPress={handleNextNotice}
                      disabled={currentNoticeIndex === displayNotices.length - 1}
                    >
                      <Text style={[styles.pageBtnText, { fontFamily: FF.medium }]}>
                        {lang === 'bn' ? 'পরবর্তী' : 'Next'}
                      </Text>
                      <MaterialIcons name="chevron-right" size={20} color={Colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>

              <View style={styles.dotRowCenter}>
                {displayNotices.map((_, i) => (
                  <View key={i} style={[styles.dotCircle, i === currentNoticeIndex && styles.dotCircleActive]} />
                ))}
              </View>
            </View>
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
            { labelBn: 'সক্রিয় অ্যাসাইনমেন্ট', labelEn: 'Active Assignments', count: activeAssignments, icon: 'assignment', colorBg: Colors.accentLight, color: Colors.accent, route: '/(teacher)/assignments' },
            { labelBn: 'আসন্ন পরীক্ষা', labelEn: 'Upcoming Exams', count: upcomingExams, icon: 'school', colorBg: '#EFF6FF', color: Colors.info, route: '/(teacher)/exams' },
            { labelBn: 'ফলাফল আপলোড', labelEn: 'Results Uploaded', count: totalResults, icon: 'bar-chart', colorBg: '#FEF3C7', color: Colors.warning, route: '/(teacher)/results' },
          ].map((item, index) => (
            <TouchableOpacity key={item.labelEn} onPress={() => router.push(item.route as any)} activeOpacity={0.8} style={{ marginBottom: index === 2 ? 0 : 12 }}>
              <Card padding={16}>
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
            </TouchableOpacity>
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
      
      <NoticeModal 
        visible={!!selectedNotice} 
        notice={selectedNotice} 
        onClose={() => setSelectedNotice(null)} 
      />
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

  pad: { paddingHorizontal: 16 },
  noticeSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingHorizontal: 4,
  },
  noticeMainTitle: { fontSize: FontSize.lg + 2, color: Colors.textPrimary },
  seeAllGreen: { fontSize: FontSize.sm, color: Colors.accent },
  
  noticeCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14,
  },
  noticeBadge: {
    backgroundColor: '#E6F0F9',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full,
  },
  noticeBadgeText: { fontSize: FontSize.xs, color: '#1A5A8A' },
  detailsBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderColor,
    backgroundColor: Colors.white 
  },
  detailsText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  
  noticeTitleLg: { fontSize: FontSize.md + 1, color: Colors.textPrimary, marginBottom: 8, lineHeight: 24 },
  noticeDescLg: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22, minHeight: 66, marginBottom: 16 },
  
  noticeDivider: { height: 1, backgroundColor: Colors.borderColor, marginBottom: 12 },
  
  noticeBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeAuthor: { fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 2 },
  noticeDateTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  
  noticePagination: { flexDirection: 'row', gap: 8 },
  pageBtn: { 
    width: 36, height: 36, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor,
    justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white 
  },
  pageBtnRight: {
    flexDirection: 'row', alignItems: 'center', height: 36, paddingHorizontal: 12,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor,
    backgroundColor: Colors.white, gap: 4,
  },
  pageBtnText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  
  dotRowCenter: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16, marginBottom: 4 },
  dotCircle: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderColor },
  dotCircleActive: { backgroundColor: Colors.accent, width: 8, height: 8 },
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
