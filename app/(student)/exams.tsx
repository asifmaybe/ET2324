import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Exam } from '../../types';

const EXAM_TYPE_BN: Record<string, string> = {
  'Class Test': 'ক্লাস টেস্ট',
  'Quiz': 'কুইজ',
  'Mid-Term': 'মধ্যবর্তী পরীক্ষা',
  'Final': 'চূড়ান্ত পরীক্ষা',
};

export default function StudentExams() {
  const { exams } = useData();
  const { lang, tr } = useLang();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const filtered = exams.filter(e => e.upcoming === (tab === 'upcoming'));
  const typeMap: Record<string, any> = { 'Class Test': 'classTest', 'Quiz': 'quiz', 'Mid-Term': 'midTerm', 'Final': 'final' };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'পরীক্ষা' : 'Exams'} />
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'upcoming' && styles.tabActive]} onPress={() => setTab('upcoming')}>
          <Text style={[styles.tabText, { fontFamily: FF.medium }, tab === 'upcoming' && styles.tabTextActive]}>
            {tr('upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'past' && styles.tabActive]} onPress={() => setTab('past')}>
          <Text style={[styles.tabText, { fontFamily: FF.medium }, tab === 'past' && styles.tabTextActive]}>
            {tr('past')}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="school" size={44} color={Colors.textMuted} />
            <Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text>
          </View>
        }
        renderItem={({ item }: { item: Exam }) => (
          <Card padding={16}>
            <View style={styles.topRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subject, { fontFamily: FF.semiBold }]}>{item.subject}</Text>
                <View style={styles.row}>
                  <StatusBadge type={typeMap[item.type] ?? 'classTest'} customLabel={lang === 'bn' ? (EXAM_TYPE_BN[item.type] ?? item.type) : item.type} />
                  <StatusBadge type={item.upcoming ? 'upcoming' : 'past'} />
                  <View style={styles.marksBadge}>
                    <MaterialIcons name="assessment" size={12} color={Colors.textSecondary} />
                    <Text style={[styles.marksText, { fontFamily: FF.medium }]}>
                      {lang === 'bn' ? 'নম্বর:' : 'Marks:'} {item.marks}
                    </Text>
                  </View>
                </View>
                {item.instructions ? (
                  <Text style={[styles.instr, { fontFamily: FF.regular }]} numberOfLines={2}>{item.instructions}</Text>
                ) : null}
              </View>
              <View style={styles.dateBox}>
                <Text style={[styles.dateText, { fontFamily: Fonts.en.bold }]}>{item.date.split('-')[2]}</Text>
                <Text style={[styles.monthText, { fontFamily: Fonts.en.medium }]}>
                  {new Date(item.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: Colors.bgSecondary, borderRadius: Radius.lg, padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tabTextActive: { color: Colors.accent },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  row: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap', marginBottom: 8 },
  subject: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 2 },
  dateBox: {
    backgroundColor: Colors.accentLight, borderRadius: Radius.md,
    padding: 10, alignItems: 'center', minWidth: 52,
    borderWidth: 1, borderColor: Colors.accentMuted,
  },
  dateText: { fontSize: FontSize.xl, color: Colors.accent },
  monthText: { fontSize: FontSize.xs, color: Colors.accent },
  instr: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  marksBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgSecondary, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor,
  },
  marksText: { fontSize: 11, color: Colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
