import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Fonts } from '../../constants/theme';
import { useLang } from '../../hooks/useLang';

type BadgeType = 'active' | 'pending' | 'overdue' | 'completed' | 'submitted' | 'upcoming' | 'past' | 'present' | 'absent' | 'late' | 'important' | 'classTest' | 'quiz' | 'midTerm' | 'final';

const CONFIG_EN: Record<BadgeType, { bg: string; color: string; label: string }> = {
  active: { bg: Colors.successBg, color: Colors.success, label: 'Active' },
  pending: { bg: Colors.warningBg, color: Colors.warning, label: 'Pending' },
  overdue: { bg: Colors.dangerBg, color: Colors.danger, label: 'Overdue' },
  completed: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'Completed' },
  submitted: { bg: Colors.infoBg, color: Colors.info, label: 'Submitted' },
  upcoming: { bg: Colors.successBg, color: Colors.success, label: 'Upcoming' },
  past: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'Past' },
  present: { bg: Colors.successBg, color: Colors.success, label: '✓ Present' },
  absent: { bg: Colors.dangerBg, color: Colors.danger, label: '✗ Absent' },
  late: { bg: Colors.warningBg, color: Colors.warning, label: 'Late' },
  important: { bg: Colors.dangerBg, color: Colors.danger, label: '●' },
  classTest: { bg: Colors.infoBg, color: Colors.info, label: 'Class Test' },
  quiz: { bg: Colors.warningBg, color: Colors.warning, label: 'Quiz' },
  midTerm: { bg: 'rgba(124,58,237,0.10)', color: '#7C3AED', label: 'Mid-Term' },
  final: { bg: Colors.dangerBg, color: Colors.danger, label: 'Final' },
};

const CONFIG_BN: Record<BadgeType, { bg: string; color: string; label: string }> = {
  active: { bg: Colors.successBg, color: Colors.success, label: 'সক্রিয়' },
  pending: { bg: Colors.warningBg, color: Colors.warning, label: 'মুলতুবি' },
  overdue: { bg: Colors.dangerBg, color: Colors.danger, label: 'মেয়াদোত্তীর্ণ' },
  completed: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'সম্পন্ন' },
  submitted: { bg: Colors.infoBg, color: Colors.info, label: 'জমা দেওয়া' },
  upcoming: { bg: Colors.successBg, color: Colors.success, label: 'আসন্ন' },
  past: { bg: 'rgba(100,116,139,0.12)', color: '#64748B', label: 'অতীত' },
  present: { bg: Colors.successBg, color: Colors.success, label: '✓ উপস্থিত' },
  absent: { bg: Colors.dangerBg, color: Colors.danger, label: '✗ অনুপস্থিত' },
  late: { bg: Colors.warningBg, color: Colors.warning, label: 'দেরি' },
  important: { bg: Colors.dangerBg, color: Colors.danger, label: '●' },
  classTest: { bg: Colors.infoBg, color: Colors.info, label: 'ক্লাস টেস্ট' },
  quiz: { bg: Colors.warningBg, color: Colors.warning, label: 'কুইজ' },
  midTerm: { bg: 'rgba(124,58,237,0.10)', color: '#7C3AED', label: 'মধ্যবর্তী' },
  final: { bg: Colors.dangerBg, color: Colors.danger, label: 'চূড়ান্ত' },
};

interface Props {
  type: BadgeType;
  customLabel?: string;
}

export function StatusBadge({ type, customLabel }: Props) {
  const { lang } = useLang();
  const CONFIG = lang === 'bn' ? CONFIG_BN : CONFIG_EN;
  const cfg = CONFIG[type] ?? CONFIG.pending;
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.color, fontFamily: FF.semiBold }]}>{customLabel ?? cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    letterSpacing: 0.2,
  },
});
