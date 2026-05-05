import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useLang } from '../../hooks/useLang';

// ── Regulation 2022 weighted CGPA ──────────────────────────────────────────
const CGPA_WEIGHTS = [0.05, 0.05, 0.10, 0.10, 0.20, 0.20, 0.20, 0.10];

function calcWeightedCGPA(gpas: number[]): number {
  let cgpa = 0;
  gpas.forEach((gpa, i) => { cgpa += gpa * CGPA_WEIGHTS[i]; });
  return parseFloat(cgpa.toFixed(2));
}

function calcPercentComplete(gpas: number[]): number {
  let pct = 0;
  gpas.forEach((gpa, i) => { if (gpa > 0) pct += CGPA_WEIGHTS[i]; });
  return Math.round(pct * 100);
}
// ───────────────────────────────────────────────────────────────────────────

const SEM_LABELS_BN = ['১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম'];
const SEM_LABELS_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

export default function CGPACalculator() {
  const { lang } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;
  const semLabels = lang === 'bn' ? SEM_LABELS_BN : SEM_LABELS_EN;
  const isBn = lang === 'bn';

  const [calcInputs, setCalcInputs] = useState<string[]>(Array(8).fill(''));
  const [calcResult, setCalcResult] = useState<{ cgpa: number; pct: number } | null>(null);

  const handleCalculate = () => {
    const gpas = calcInputs.map(v => {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : Math.min(4.0, Math.max(0, n));
    });
    setCalcResult({ cgpa: calcWeightedCGPA(gpas), pct: calcPercentComplete(gpas) });
  };

  const handleReset = () => {
    setCalcInputs(Array(8).fill(''));
    setCalcResult(null);
  };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'সিজিপিএ ক্যালকুলেটর' : 'CGPA Calculator'} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>

        {/* Info banner */}
        <Card padding={16} style={{ marginBottom: 20, marginTop: 4, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={styles.infoBg}>
            <MaterialIcons name="info-outline" size={20} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { fontFamily: FF.semiBold }]}>
              {lang === 'bn' ? 'রেগুলেশন ২০২২' : 'Regulation 2022'}
            </Text>
            <Text style={[styles.infoSub, { fontFamily: FF.regular }]}>
              {lang === 'bn'
                ? 'ভারযুক্ত সূত্র: প্রতিটি সেমিস্টারের ওজন আলাদা।'
                : 'Weighted formula: each semester has a different weight.'}
            </Text>
          </View>
        </Card>

        {/* Weight legend */}
        <Text style={[styles.sectionLabel, { fontFamily: FF.semiBold }, !isBn && { textTransform: 'uppercase', letterSpacing: 0.5 }]}>
          {isBn ? 'সেমিস্টার ওজন' : 'Semester Weights'}
        </Text>
        <View style={styles.weightRow}>
          {CGPA_WEIGHTS.map((w, i) => (
            <View key={i} style={styles.weightChip}>
              <Text style={[styles.weightSem, { fontFamily: FF.semiBold }]}>{semLabels[i]}</Text>
              <Text style={[styles.weightVal, { fontFamily: Fonts.en.bold }]}>{(w * 100).toFixed(0)}%</Text>
            </View>
          ))}
        </View>

        {/* Inputs */}
        <Text style={[styles.sectionLabel, { fontFamily: FF.semiBold, marginTop: 20 }, !isBn && { textTransform: 'uppercase', letterSpacing: 0.5 }]}>
          {isBn ? 'সেমিস্টার জিপিএ প্রবেশ করান' : 'Enter Semester GPAs'}
        </Text>
        <Card padding={20} style={{ marginBottom: 16 }}>
          <View style={styles.calcGrid}>
            {semLabels.map((label, i) => (
              <View key={i} style={styles.calcInputWrapper}>
                <Text style={[styles.calcLabel, { fontFamily: FF.semiBold }]}>{label} {isBn ? 'সেমিস্টার' : 'Sem'}</Text>
                <TextInput
                  style={[styles.calcInput, { fontFamily: Fonts.en.regular }]}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={calcInputs[i]}
                  onChangeText={v => {
                    const updated = [...calcInputs];
                    updated[i] = v;
                    setCalcInputs(updated);
                  }}
                  maxLength={4}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.calcBtn} activeOpacity={0.85} onPress={handleCalculate}>
            <MaterialIcons name="calculate" size={18} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={[styles.calcBtnText, { fontFamily: FF.bold }]}>
              {lang === 'bn' ? 'হিসাব করুন' : 'Calculate'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Result */}
        {calcResult && (
          <Card padding={24} style={{ marginBottom: 16, alignItems: 'center' }}>
            <Text style={[styles.resultHeading, { fontFamily: FF.semiBold }]}>
              {lang === 'bn' ? 'আপনার সিজিপিএ' : 'Your CGPA'}
            </Text>
            <Text style={[styles.calcCGPAValue, { fontFamily: Fonts.en.bold }]}>
              {calcResult.cgpa.toFixed(2)}
            </Text>
            <Text style={[styles.calcCGPALabel, { fontFamily: FF.regular }]}>
              {lang === 'bn' ? '৪.০ এর মধ্যে' : 'out of 4.0'}
            </Text>

            {/* Progress bar */}
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round((calcResult.cgpa / 4.0) * 100)}%` as any },
                ]}
              />
            </View>

            <View style={styles.calcBadge}>
              <MaterialIcons name="check-circle" size={14} color={Colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.calcBadgeText, { fontFamily: FF.semiBold }]}>
                {calcResult.pct}% {lang === 'bn' ? 'সম্পন্ন' : 'Complete'}
              </Text>
            </View>
          </Card>
        )}

        {/* Reset */}
        <TouchableOpacity style={styles.resetBtn} activeOpacity={0.85} onPress={handleReset}>
          <MaterialIcons name="refresh" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.resetBtnText, { fontFamily: FF.medium }]}>
            {lang === 'bn' ? 'রিসেট' : 'Reset'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  infoBg: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 2 },
  infoSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  weightRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4,
  },
  weightChip: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center',
  },
  weightSem: { fontSize: FontSize.xs, color: Colors.textSecondary },
  weightVal: { fontSize: FontSize.sm, color: Colors.accent, marginTop: 1 },
  calcGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  calcInputWrapper: { width: '47%' },
  calcLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  calcInput: {
    borderWidth: 1, borderColor: Colors.borderColor, borderRadius: Radius.sm,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: FontSize.md, color: Colors.textPrimary,
    backgroundColor: Colors.bgSecondary,
  },
  calcBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center', marginBottom: 0,
    flexDirection: 'row', justifyContent: 'center',
  },
  calcBtnText: { color: Colors.white, fontSize: FontSize.md },
  resultHeading: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 8 },
  calcCGPAValue: { fontSize: 64, color: Colors.accent, lineHeight: 72 },
  calcCGPALabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 16 },
  progressBg: {
    height: 8, backgroundColor: Colors.bgTertiary, borderRadius: 4,
    overflow: 'hidden', width: '100%', marginBottom: 16,
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  calcBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderRadius: 100,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  calcBadgeText: { fontSize: FontSize.sm, color: Colors.accent },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderColor, borderRadius: Radius.md,
    paddingVertical: 12,
  },
  resetBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
