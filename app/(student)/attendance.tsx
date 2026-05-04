import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MOCK_ATTENDANCE } from '../../constants/mockData';

const MONTHS_BN = ['জান', 'ফেব', 'মার', 'এপ্র', 'মে', 'জুন', 'জুল', 'আগ', 'সেপ', 'অক্ট', 'নভ', 'ডিস'];

export default function StudentAttendance() {
  const { user } = useAuth();
  const { lang } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const attendancePct = user?.attendance_percent ?? 0;
  const presentCount = MOCK_ATTENDANCE.filter(a => a.status === 'present').length;
  const absentCount = MOCK_ATTENDANCE.filter(a => a.status === 'absent').length;

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'আমার উপস্থিতি' : 'My Attendance'} />
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        {/* Summary Card */}
        <Card padding={16}>
          <View style={styles.summaryRow}>
            {[
              { num: `${attendancePct}%`, label: lang === 'bn' ? 'মোট' : 'Overall', color: attendancePct >= 75 ? Colors.accent : Colors.danger },
              { num: String(presentCount), label: lang === 'bn' ? 'উপস্থিত' : 'Present', color: Colors.accent },
              { num: String(absentCount), label: lang === 'bn' ? 'অনুপস্থিত' : 'Absent', color: Colors.danger },
            ].map((item, i) => (
              <View key={i} style={styles.summaryItem}>
                <Text style={[styles.summaryNum, { fontFamily: Fonts.en.bold, color: item.color }]}>{item.num}</Text>
                <Text style={[styles.summaryLabel, { fontFamily: FF.regular }]}>{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${attendancePct}%` as any,
              backgroundColor: attendancePct >= 75 ? Colors.accent : Colors.danger,
            }]} />
          </View>
          <Text style={[styles.progressNote, { fontFamily: FF.regular }]}>
            {attendancePct >= 75
              ? (lang === 'bn' ? 'উপস্থিতি সন্তোষজনক' : 'Attendance is satisfactory')
              : (lang === 'bn' ? 'সতর্কতা: উপস্থিতি ৭৫% এর নিচে' : 'Warning: Attendance below 75%')
            }
          </Text>
        </Card>

        <Text style={[styles.histTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
          {lang === 'bn' ? 'উপস্থিতির ইতিহাস' : 'Attendance History'}
        </Text>
        <FlatList
          data={MOCK_ATTENDANCE}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const d = new Date(item.date + 'T00:00:00');
            const dayNum = d.getDate();
            const monthLabel = lang === 'bn' ? MONTHS_BN[d.getMonth()] : d.toLocaleString('default', { month: 'short' });
            return (
              <Card padding={14}>
                <View style={styles.record}>
                  <View style={styles.dateBox}>
                    <Text style={[styles.dateDay, { fontFamily: Fonts.en.bold }]}>{dayNum}</Text>
                    <Text style={[styles.dateMon, { fontFamily: FF.regular }]}>{monthLabel}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recSubject, { fontFamily: FF.semiBold }]} numberOfLines={1}>{item.subject}</Text>
                    {item.remarks ? <Text style={[styles.recRemarks, { fontFamily: FF.regular }]}>{item.remarks}</Text> : null}
                  </View>
                  <StatusBadge type={item.status as any} />
                </View>
              </Card>
            );
          }}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: FontSize.xl },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  progressBg: { height: 7, backgroundColor: Colors.bgTertiary, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 7, borderRadius: 4 },
  progressNote: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  histTitle: { fontSize: FontSize.lg, color: Colors.textPrimary, marginBottom: 12 },
  record: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBox: {
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.md,
    paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 44,
  },
  dateDay: { fontSize: FontSize.lg, color: Colors.textPrimary },
  dateMon: { fontSize: 10, color: Colors.textMuted },
  recSubject: { fontSize: FontSize.sm, color: Colors.textPrimary },
  recRemarks: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
