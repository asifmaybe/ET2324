import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { useLocalSearchParams } from 'expo-router';
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
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

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
            ListHeaderComponent={
              selectedCategory === 'Board' ? (
                <View style={{ marginBottom: 16 }}>
                  <Card padding={24} style={{ marginBottom: 24 }}>
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                      <Text style={{ fontSize: 48, color: Colors.accent, fontFamily: Fonts.en.bold }}>
                        3.70
                      </Text>
                      <Text style={{ fontSize: FontSize.md, color: Colors.textSecondary, fontFamily: FF.regular, marginTop: -4 }}>
                        {lang === 'bn' ? '৪.০ এর মধ্যে' : 'out of 4.0'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <View style={[styles.progressBg, { flex: 1, marginBottom: 0, height: 8, borderRadius: 4 }]}>
                        <View style={[styles.progressFill, { width: '93%', backgroundColor: Colors.accent, height: 8, borderRadius: 4 }]} />
                      </View>
                      <Text style={{ fontSize: FontSize.md, fontFamily: Fonts.en.bold, color: Colors.textPrimary }}>93%</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.borderColor }}>
                      <MaterialIcons name="trending-up" size={18} color={Colors.success} />
                      <Text style={{ fontSize: FontSize.sm, color: Colors.success, fontFamily: FF.medium }}>
                        {lang === 'bn' ? 'গত সেমিস্টার থেকে ০.২ বেশি' : 'Up 0.2 from last semester'}
                      </Text>
                    </View>
                  </Card>

                  <Text style={[styles.progressTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold, marginTop: 8, marginBottom: 16 }]}>
                    {lang === 'bn' ? 'সেমিস্টার ব্রেকডাউন' : 'Semester Breakdown'}
                  </Text>

                  <Card padding={16} style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.catIconBox, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialIcons name="auto-graph" size={22} color={Colors.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: FontSize.md, fontFamily: FF.semiBold, color: Colors.textPrimary }}>
                          {lang === 'bn' ? '৪র্থ সেমিস্টার' : '4th Semester'}
                        </Text>
                        <Text style={{ fontSize: FontSize.sm, fontFamily: FF.regular, color: Colors.textSecondary, marginTop: 2 }}>
                          {lang === 'bn' ? '২১ ক্রেডিট' : '21 Credits'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: FontSize.lg + 2, fontFamily: Fonts.en.bold, color: Colors.success }}>3.80</Text>
                        <Text style={{ fontSize: 10, fontFamily: Fonts.en.medium, color: Colors.textMuted }}>GPA</Text>
                      </View>
                    </View>
                  </Card>

                  <Card padding={16} style={{ marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.catIconBox, { backgroundColor: '#E8F5E9' }]}>
                        <MaterialIcons name="auto-graph" size={22} color={Colors.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: FontSize.md, fontFamily: FF.semiBold, color: Colors.textPrimary }}>
                          {lang === 'bn' ? '৩য় সেমিস্টার' : '3rd Semester'}
                        </Text>
                        <Text style={{ fontSize: FontSize.sm, fontFamily: FF.regular, color: Colors.textSecondary, marginTop: 2 }}>
                          {lang === 'bn' ? '১৯ ক্রেডিট' : '19 Credits'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: FontSize.lg + 2, fontFamily: Fonts.en.bold, color: Colors.success }}>3.60</Text>
                        <Text style={{ fontSize: 10, fontFamily: Fonts.en.medium, color: Colors.textMuted }}>GPA</Text>
                      </View>
                    </View>
                  </Card>

                  {(user?.failed_subjects ?? 0) > 0 && (
                    <>
                      <Text style={[styles.progressTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold, marginTop: 8, marginBottom: 16 }]}>
                        {lang === 'bn' ? 'উত্তীর্ণ হওয়া বাকি' : 'Subjects to Clear'}
                      </Text>
                      <Card padding={16} style={{ marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                          <View style={[styles.catIconBox, { backgroundColor: Colors.dangerBg, marginTop: 2 }]}>
                            <MaterialIcons name="warning" size={22} color={Colors.danger} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: FontSize.md, fontFamily: FF.semiBold, color: Colors.textPrimary, marginBottom: 4 }}>
                              {lang === 'bn' ? 'ইন্ডাস্ট্রিয়াল ম্যানেজমেন্ট' : 'Industrial Management'}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <MaterialIcons name="history" size={14} color={Colors.danger} />
                              <Text style={{ fontSize: FontSize.sm, fontFamily: FF.medium, color: Colors.danger }}>
                                {lang === 'bn' ? '৩য় সেমিস্টার' : '3rd Semester'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Card>
                    </>
                  )}
                  {filteredResults.length > 0 && (
                    <Text style={[styles.progressTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold, marginTop: 8, marginBottom: 16 }]}>
                      {lang === 'bn' ? 'বোর্ড পরীক্ষার ফলাফল' : 'Board Exam Results'}
                    </Text>
                  )}
                </View>
              ) : null
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
