import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const myResults = results.filter(r => r.student_id === user?.student_id);
  const typeMap: Record<string, any> = { 'Class Test': 'classTest', 'Quiz': 'quiz', 'Mid-Term': 'midTerm', 'Final': 'final' };

  const categories = [
    { id: 'Class Tests', titleEn: 'Class Tests', titleBn: 'ক্লাস টেস্ট', icon: 'assignment' },
    { id: 'Mid-term', titleEn: 'Mid-term', titleBn: 'মধ্যবর্তী পরীক্ষা', icon: 'grading' },
    { id: 'Board', titleEn: 'Board', titleBn: 'বোর্ড পরীক্ষা', icon: 'school' }
  ];

  const filteredResults = selectedCategory 
    ? myResults.filter(r => {
        if (selectedCategory === 'Class Tests') return r.exam_type === 'Class Test' || r.exam_type === 'Quiz';
        if (selectedCategory === 'Mid-term') return r.exam_type === 'Mid-Term';
        if (selectedCategory === 'Board') return r.exam_type === 'Final';
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
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <Text style={[styles.progressTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
            {lang === 'bn' ? 'আপনার অগ্রগতি' : 'Your Progress'}
          </Text>
          <Text style={[styles.progressSub, { fontFamily: FF.regular }]}>
            {lang === 'bn' ? 'সকল মূল্যায়নে আপনার একাডেমিক পারফরম্যান্স পর্যালোচনা করুন।' : 'Review your academic performance across all assessments.'}
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
      ) : (
        <View style={{ paddingHorizontal: 16, flex: 1 }}>
          <FlatList
            data={filteredResults}
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
      )}
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
  progressTitle: { fontSize: FontSize.xl + 2, color: Colors.textPrimary, marginBottom: 4, marginTop: 16 },
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
