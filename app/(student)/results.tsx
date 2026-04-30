import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Result } from '../../types';

const EXAM_TYPE_BN: Record<string, string> = {
  'Class Test': 'ক্লাস টেস্ট',
  'Quiz': 'কুইজ',
  'Mid-Term': 'মধ্যবর্তী পরীক্ষা',
  'Final': 'চূড়ান্ত পরীক্ষা',
};

export default function StudentResults() {
  const { user } = useAuth();
  const { results } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const myResults = results.filter(r => r.student_id === user?.student_id);
  const typeMap: Record<string, any> = { 'Class Test': 'classTest', 'Quiz': 'quiz', 'Mid-Term': 'midTerm', 'Final': 'final' };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'ফলাফল' : 'Results'} showPanelSwitch />
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        <FlatList
          data={myResults}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="bar-chart" size={44} color={Colors.textMuted} />
              <Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text>
            </View>
          }
          renderItem={({ item }: { item: Result }) => {
            const pct = Math.round((item.marks / item.total_marks) * 100);
            const isGood = pct >= 60;
            return (
              <Card padding={16}>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.subject, { fontFamily: FF.semiBold }]}>{item.subject}</Text>
                    <View style={styles.row}>
                      <StatusBadge
                        type={typeMap[item.exam_type] ?? 'classTest'}
                        customLabel={lang === 'bn' ? (EXAM_TYPE_BN[item.exam_type] ?? item.exam_type) : item.exam_type}
                      />
                    </View>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, {
                        width: `${pct}%` as any,
                        backgroundColor: isGood ? Colors.accent : Colors.danger,
                      }]} />
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                        {pct}% · {item.date}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.scoreBox, { borderColor: isGood ? Colors.accent : Colors.danger }]}>
                    <Text style={[styles.scoreNum, { fontFamily: Fonts.en.bold, color: isGood ? Colors.accent : Colors.danger }]}>{item.marks}</Text>
                    <View style={styles.scoreDivider} />
                    <Text style={[styles.scoreTotal, { fontFamily: Fonts.en.medium }]}>{item.total_marks}</Text>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  row: { flexDirection: 'row', gap: 6, marginTop: 6, marginBottom: 8 },
  subject: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 2 },
  scoreBox: {
    alignItems: 'center', borderRadius: Radius.md, borderWidth: 2,
    paddingHorizontal: 12, paddingVertical: 8, minWidth: 60,
  },
  scoreNum: { fontSize: FontSize.xl + 2 },
  scoreDivider: { height: 1, width: '100%', backgroundColor: Colors.borderColor, marginVertical: 3 },
  scoreTotal: { fontSize: FontSize.sm, color: Colors.textSecondary },
  progressBg: { height: 5, backgroundColor: Colors.bgTertiary, borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
