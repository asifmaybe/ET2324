import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/theme';

interface Props {
  title: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

export function SectionTitle({ title, onSeeAll, seeAllLabel = 'See All' }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll ? (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>{seeAllLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '600' },
});
