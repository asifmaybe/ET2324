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
import { Assignment } from '../../types';

const FILTERS = ['all', 'active', 'pending', 'overdue', 'submitted', 'completed'];

export default function StudentAssignments() {
  const { assignments } = useData();
  const { lang, tr } = useLang();
  const [filter, setFilter] = useState('all');
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);

  const filterLabel: Record<string, string> = {
    all: lang === 'bn' ? 'সব' : 'All',
    active: tr('active'),
    pending: tr('pending'),
    overdue: tr('overdueStatus'),
    submitted: tr('submitted'),
    completed: tr('completed'),
  };

  const renderItem = ({ item }: { item: Assignment }) => (
    <Card padding={16}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { fontFamily: FF.semiBold }]}>{item.title}</Text>
          <Text style={[styles.subject, { fontFamily: FF.regular }]}>{item.subject}</Text>
          <Text style={[styles.desc, { fontFamily: FF.regular }]} numberOfLines={2}>{item.description}</Text>
          <View style={styles.meta}>
            <MaterialIcons name="event" size={13} color={Colors.textMuted} />
            <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
              {lang === 'bn' ? 'জমা:' : 'Due:'} {item.due_date}
            </Text>
          </View>
        </View>
        <StatusBadge type={item.status as any} />
      </View>
    </Card>
  );

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'অ্যাসাইনমেন্ট' : 'Assignments'} showPanelSwitch />
      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterBtn, filter === item && styles.filterActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, { fontFamily: FF.medium }, filter === item && styles.filterTextActive]}>
                {filterLabel[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="assignment" size={44} color={Colors.textMuted} />
            <Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterWrap: { paddingVertical: 8 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.borderColor,
  },
  filterActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  filterTextActive: { color: Colors.accent },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  title: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 3 },
  subject: { fontSize: FontSize.sm, color: Colors.accent, marginBottom: 4 },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
