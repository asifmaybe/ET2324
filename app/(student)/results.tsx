import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BoardSummarySkeleton, ResultCardSkeleton, useShimmer } from '../../components/ui/SkeletonLoader';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Result } from '../../types';

// ── Regulation 2022 weighted CGPA ──────────────────────────────────────────
const CGPA_WEIGHTS = [0.05, 0.05, 0.10, 0.10, 0.20, 0.20, 0.20, 0.10];

function calcWeightedCGPA(gpas: number[]): number {
  let cgpa = 0;
  gpas.forEach((gpa, i) => { cgpa += gpa * (CGPA_WEIGHTS[i] || 0); });
  return parseFloat(cgpa.toFixed(2));
}

function calcPercentComplete(gpas: number[]): number {
  let pct = 0;
  gpas.forEach((gpa, i) => { if (gpa > 0) pct += (CGPA_WEIGHTS[i] || 0); });
  return Math.round(pct * 100);
}
// ───────────────────────────────────────────────────────────────────────────

const SEM_LABELS_BN = ['১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম'];
const SEM_LABELS_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const EXAM_TYPE_BN: Record<string, string> = {
  'Class Test': 'ক্লাস টেস্ট',
  'Quiz': 'কুইজ',
  'Mid-Term': 'মধ্যবর্তী পরীক্ষা',
  'Final': 'চূড়ান্ত পরীক্ষা',
};

function formatRelativeTime(dateString: string, lang: 'en' | 'bn'): string {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  if (lang === 'bn') return `${diffDays} দিন আগে`;
  return `${diffDays} days ago`;
}

function formatDate(dateString: string, lang: 'en' | 'bn'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  if (lang === 'bn') {
    return date.toLocaleDateString('bn-BD', options);
  }
  return date.toLocaleDateString('en-US', options);
}

export default function StudentResults() {
  const { user } = useAuth();
  const { results, semesterResults, referredSubjects, publishedSemesters, boardResultsLoading, dataLoading } = useData();
  const { lang, tr } = useLang();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;
  const isBn = lang === 'bn';
  const shimmer = useShimmer(dataLoading || boardResultsLoading);

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
        return false;
      })
    : [];

  // --- Board Result Logic ---
  const myRoll = user?.roll_number || '';
  
  // Total yet to pass
  const myUnclearedRefs = referredSubjects.filter(r => r.roll_no === myRoll && r.cleared_in_semester === null);
  const totalYetToPass = myUnclearedRefs.length;

  // Process GPAs
  const semesterGPAs = Array(8).fill(0);
  const mySemResults = semesterResults.filter(sr => sr.roll_no === myRoll);
  mySemResults.forEach(sr => {
    if (sr.gpa && sr.semester_number >= 1 && sr.semester_number <= 8) {
      semesterGPAs[sr.semester_number - 1] = sr.gpa;
    }
  });

  const computedCGPA = calcWeightedCGPA(semesterGPAs);
  const cgpaProgressPct = Math.round((computedCGPA / 4.0) * 100);
  
  // Build Semester Cards
  // Published semesters descending (newest first)
  const publishedSemsDesc = [...publishedSemesters].sort((a, b) => b.semester_number - a.semester_number);

  const renderBoardSection = () => {
    if (boardResultsLoading) {
      return (
        <View style={{ paddingTop: 8, paddingBottom: 24 }}>
          <BoardSummarySkeleton opacity={shimmer} />
        </View>
      );
    }

    if (publishedSemesters.length === 0) {
      return (
        <View style={styles.empty}>
          <MaterialIcons name="school" size={44} color={Colors.textMuted} />
          <Text style={[styles.emptyText, { fontFamily: FF.regular }]}>
            {isBn ? 'কোনো বোর্ড ফলাফল প্রকাশিত হয়নি' : 'No board results published yet'}
          </Text>
        </View>
      );
    }

    return (
      <View style={{ paddingBottom: 24 }}>
        {/* Top Banner */}
        {publishedSemsDesc.length > 0 && (
          <View style={[
            styles.topBanner,
            { backgroundColor: totalYetToPass > 0 ? Colors.dangerBg : Colors.successBg,
              borderColor: totalYetToPass > 0 ? 'rgba(214,48,49,0.3)' : 'rgba(26,107,60,0.3)' }
          ]}>
            <MaterialIcons name={totalYetToPass > 0 ? "warning" : "check-circle"} size={24} color={totalYetToPass > 0 ? Colors.danger : Colors.success} />
            <Text style={[styles.topBannerText, { fontFamily: FF.semiBold, color: totalYetToPass > 0 ? Colors.danger : Colors.success }]}>
              {totalYetToPass > 0 
                ? (isBn ? `${totalYetToPass} টি বিষয়ে পাস করতে হবে` : `${totalYetToPass} subjects yet to pass`)
                : (isBn ? 'সব বিষয়ে পাস করেছেন ✓' : 'All Passed ✓')}
            </Text>
          </View>
        )}

        {/* CGPA Summary */}
        <Card padding={24} style={{ marginBottom: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 48, color: Colors.accent, fontFamily: Fonts.en.bold }}>
              {computedCGPA.toFixed(2)}
            </Text>
            <Text style={{ fontSize: FontSize.md, color: Colors.textSecondary, fontFamily: FF.regular, marginTop: -4 }}>
              {isBn ? '৪.০ এর মধ্যে' : 'out of 4.0'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.progressBg, { flex: 1, marginBottom: 0, height: 8, borderRadius: 4 }]}>
              <View style={[styles.progressFill, { width: `${cgpaProgressPct}%` as any, backgroundColor: Colors.accent, height: 8, borderRadius: 4 }]} />
            </View>
            <Text style={{ fontSize: FontSize.md, fontFamily: Fonts.en.bold, color: Colors.textPrimary }}>{cgpaProgressPct}%</Text>
          </View>
        </Card>

        {/* Semester Cards */}
        <Text style={[styles.progressTitle, { fontFamily: FF.bold, marginTop: 8, marginBottom: 16 }]}>
          {isBn ? 'সেমিস্টার ফলাফল' : 'Semester Results'}
        </Text>

        {publishedSemsDesc.map(pubSem => {
          const semRes = mySemResults.find(sr => sr.semester_number === pubSem.semester_number);
          const semRefs = referredSubjects.filter(rs => rs.roll_no === myRoll && rs.semester_number === pubSem.semester_number);
          const pendingSemRefs = semRefs.filter(rs => rs.cleared_in_semester === null);
          
          let state = 'passed';
          let badgeColor = Colors.success;
          let badgeBg = Colors.successBg;
          let badgeText = isBn ? '✓ পাস' : '✓ Passed';

          if (!semRes) {
            // Technically shouldn't happen if seeded correctly, but fallback
            state = 'missing';
            badgeColor = Colors.textMuted;
            badgeBg = Colors.bgSecondary;
            badgeText = isBn ? 'ফলাফল নেই' : 'No Result';
          } else if (semRes.is_missing) {
            state = 'missing';
            badgeColor = Colors.textMuted;
            badgeBg = Colors.bgSecondary;
            badgeText = isBn ? 'ফলাফল অনুপস্থিত' : 'Missing Result';
          } else if (pendingSemRefs.length > 0) {
            state = 'has_refs';
            badgeColor = Colors.danger;
            badgeBg = Colors.dangerBg;
            badgeText = isBn ? `⊗ ${pendingSemRefs.length} টি বাকি` : `⊗ ${pendingSemRefs.length} yet to pass`;
          }

          const semLabel = isBn ? `${SEM_LABELS_BN[pubSem.semester_number - 1] || pubSem.semester_number} সেমিস্টার` : `${SEM_LABELS_EN[pubSem.semester_number - 1] || pubSem.semester_number} Semester`;

          return (
            <Card key={pubSem.semester_number} padding={0} style={{ marginBottom: 16, overflow: 'hidden' }}>
              {/* Header */}
              <View style={styles.semHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialIcons name="school" size={20} color={Colors.textPrimary} />
                  <Text style={[styles.semTitle, { fontFamily: FF.semiBold }]}>
                    {semLabel}
                  </Text>
                </View>
                <View style={[styles.semBadge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.semBadgeText, { color: badgeColor, fontFamily: FF.medium }]}>
                    {badgeText}
                  </Text>
                </View>
              </View>

              {/* Body */}
              <View style={{ padding: 16 }}>
                {/* Dates */}
                <View style={styles.dateRow}>
                  <Text style={[styles.dateText, { fontFamily: FF.regular }]}>
                    {isBn ? 'প্রকাশিত: ' : 'Published: '}
                    {formatDate(pubSem.published_at, lang)}
                  </Text>
                  <Text style={[styles.dateText, { fontFamily: FF.regular, color: Colors.textMuted }]}>
                    {formatRelativeTime(pubSem.published_at, lang)}
                  </Text>
                </View>

                {/* GPA Box */}
                {semRes && semRes.gpa !== null && (
                  <View style={styles.gpaBox}>
                    <Text style={[styles.gpaLabel, { fontFamily: FF.semiBold }]}>GPA</Text>
                    <Text style={[styles.gpaValue, { fontFamily: Fonts.en.bold }]}>{semRes.gpa.toFixed(2)}</Text>
                  </View>
                )}

                {/* Referred Subjects List */}
                {semRefs.length > 0 && (
                  <View style={styles.refsContainer}>
                    <Text style={[styles.refsTitle, { fontFamily: FF.medium }]}>
                      {isBn ? 'রেফার্ড বিষয়সমূহ' : 'Referred Subjects'}
                    </Text>
                    {semRefs.map((rs, idx) => {
                      const isCleared = rs.cleared_in_semester !== null;
                      return (
                        <View key={rs.id} style={[styles.refRow, idx !== semRefs.length - 1 && styles.refBorder]}>
                          <View style={{ flex: 1, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                            <Text style={[styles.refCode, { fontFamily: Fonts.en.medium, opacity: isCleared ? 0.5 : 1 }]}>
                              {rs.subject_code}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text 
                                style={[
                                  styles.refName, 
                                  { fontFamily: FF.regular },
                                  isCleared && { textDecorationLine: 'line-through', color: Colors.textMuted }
                                ]}
                              >
                                {rs.subject_name}
                              </Text>
                              <Text style={[styles.refType, { fontFamily: FF.regular, opacity: isCleared ? 0.5 : 1 }]}>
                                [{rs.subject_type}]
                              </Text>
                            </View>
                          </View>
                          {isCleared ? (
                            <View style={[styles.refStatusPill, { backgroundColor: Colors.successBg }]}>
                              <Text style={[styles.refStatusText, { color: Colors.success, fontFamily: FF.medium }]}>
                                {isBn ? `ক্লিয়ার (${SEM_LABELS_BN[rs.cleared_in_semester! - 1] || rs.cleared_in_semester})` : `Cleared (${SEM_LABELS_EN[rs.cleared_in_semester! - 1] || rs.cleared_in_semester})`}
                              </Text>
                            </View>
                          ) : (
                            <View style={[styles.refStatusPill, { backgroundColor: Colors.dangerBg }]}>
                              <Text style={[styles.refStatusText, { color: Colors.danger, fontFamily: FF.medium }]}>
                                {isBn ? 'পাস বাকি' : 'Pending'}
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    );
  };

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
          {selectedCategory === 'Board' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderBoardSection()}
            </ScrollView>
          ) : (
            <FlatList
              data={dataLoading ? [] : filteredResults}
              keyExtractor={i => i.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListHeaderComponent={
                dataLoading ? (
                  <View>
                    {[1, 2, 3, 4].map(k => <ResultCardSkeleton key={k} opacity={shimmer} />)}
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !dataLoading ? (
                  <View style={styles.empty}>
                    <MaterialIcons name="bar-chart" size={44} color={Colors.textMuted} />
                    <Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text>
                  </View>
                ) : null
              }
              renderItem={({ item }: { item: Result }) => {
                const pct = Math.round((item.marks / item.total_marks) * 100);
                const isGood = pct >= 60;
                return (
                  <Card padding={16} style={{ marginBottom: 12 }}>
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
          )}
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
  
  // Board Result specific styles
  topBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: Radius.lg, borderWidth: 1,
    marginBottom: 20, marginTop: 8
  },
  topBannerText: { fontSize: FontSize.md + 1, flex: 1 },
  semHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: Colors.bgSecondary,
    borderBottomWidth: 1, borderBottomColor: Colors.borderColor
  },
  semTitle: { fontSize: FontSize.lg, color: Colors.textPrimary },
  semBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  semBadgeText: { fontSize: FontSize.sm },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dateText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  gpaBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: Colors.accentLight, padding: 12, borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(26,107,60,0.2)', marginBottom: 16
  },
  gpaLabel: { fontSize: FontSize.md, color: Colors.accent },
  gpaValue: { fontSize: FontSize.xl + 4, color: Colors.accent },
  refsContainer: {
    borderTopWidth: 1, borderTopColor: Colors.borderColor, paddingTop: 16,
  },
  refsTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 12 },
  refRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  refBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderColor },
  refCode: { fontSize: FontSize.md, color: Colors.textPrimary, width: 55 },
  refName: { fontSize: FontSize.md, color: Colors.textPrimary },
  refType: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  refStatusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  refStatusText: { fontSize: FontSize.xs },
});
