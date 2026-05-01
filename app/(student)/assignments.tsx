import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DeleteModal } from '../../components/ui/DeleteModal';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Assignment } from '../../types';

const FILTERS = ['all', 'active', 'pending', 'overdue', 'submitted', 'completed'];

export default function StudentAssignments() {
  const { assignments, updateAssignment } = useData();
  const { lang, tr } = useLang();
  const [filter, setFilter] = useState('all');
  const [actionItem, setActionItem] = useState<{ id: string; type: 'submit' | 'cancel' } | null>(null);
  const [modalType, setModalType] = useState<'submit' | 'cancel'>('submit');
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);

  const filterLabel: Record<string, string> = {
    all: lang === 'bn' ? 'সব' : 'All',
    active: lang === 'bn' ? 'চলমান' : 'Ongoing',
    pending: tr('pending'),
    overdue: tr('overdueStatus'),
    submitted: tr('submitted'),
    completed: tr('completed'),
  };

  const handleToggleSubmit = (item: Assignment) => {
    if (item.status === 'submitted') {
      setModalType('cancel');
      setActionItem({ id: item.id, type: 'cancel' });
    } else {
      setModalType('submit');
      setActionItem({ id: item.id, type: 'submit' });
    }
  };

  const confirmAction = () => {
    if (actionItem) {
      const item = assignments.find(a => a.id === actionItem.id);
      if (item) {
        updateAssignment({ ...item, status: actionItem.type === 'submit' ? 'submitted' : 'active' });
      }
      setActionItem(null);
    }
  };

  const renderItem = ({ item }: { item: Assignment }) => (
    <Card padding={16} style={{ marginBottom: 12 }}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text style={[styles.subject, { fontFamily: FF.regular, flex: 1, marginBottom: 0 }]} numberOfLines={1}>{item.subject}</Text>
            <StatusBadge type={item.status as any} />
          </View>
          <Text style={[styles.title, { fontFamily: FF.semiBold, marginBottom: 4 }]}>{item.title}</Text>
          <Text style={[styles.desc, { fontFamily: FF.regular }]} numberOfLines={2}>{item.description}</Text>

          {item.updated_at && item.created_at && item.updated_at !== item.created_at ? (
            <View style={styles.editedPill}>
              <MaterialIcons name="edit" size={11} color={Colors.textMuted} />
              <Text style={[styles.editedPillText, { fontFamily: FF.regular }]}>
                {lang === 'bn' ? 'শেষ সম্পাদনা:' : 'Last edited by'} {item.updated_by} • {new Date(item.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ) : null}

          <View style={styles.divider} />
          <View style={styles.bottomRow}>
            <View style={styles.datesContainer}>
              <View style={styles.meta}>
                <MaterialIcons name="event" size={14} color={Colors.textMuted} />
                <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                  {lang === 'bn' ? 'শুরু:' : 'Start:'} {item.assigned_date}
                </Text>
              </View>
              <View style={styles.meta}>
                <MaterialIcons name="event-available" size={14} color={Colors.textMuted} />
                <Text style={[styles.metaText, { fontFamily: Fonts.en.regular }]}>
                  {lang === 'bn' ? 'জমা:' : 'Due:'} {item.due_date}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitToggle, item.status === 'submitted' && styles.submitToggleActive]}
              onPress={() => handleToggleSubmit(item)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={item.status === 'submitted' ? 'check-circle' : 'radio-button-unchecked'}
                size={16}
                color={item.status === 'submitted' ? Colors.success : Colors.textSecondary}
              />
              <Text style={[
                styles.submitToggleText,
                { fontFamily: FF.medium },
                item.status === 'submitted' && { color: Colors.success }
              ]}>
                {item.status === 'submitted'
                  ? (lang === 'bn' ? 'জমা দেওয়া হয়েছে' : 'Submitted')
                  : (lang === 'bn' ? 'জমা হিসেবে চিহ্নিত করুন' : 'Mark as Submitted')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'অ্যাসাইনমেন্ট' : 'Assignments'} />
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

      <DeleteModal
        visible={!!actionItem}
        message={
          modalType === 'submit'
            ? (lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি অ্যাসাইনমেন্ট জমা দিয়েছেন?' : 'Are you sure that you have submitted the assignment?')
            : (lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি জমা বাতিল করতে চান?' : 'Are you sure that you want to cancel the submission?')
        }
        onConfirm={confirmAction}
        onCancel={() => setActionItem(null)}
        confirmLabel={lang === 'bn' ? 'হ্যাঁ' : 'Yes'}
        cancelLabel={lang === 'bn' ? 'না' : 'No'}
        confirmVariant={modalType === 'submit' ? 'primary' : 'danger'}
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2, gap: 8 },
  title: { fontSize: FontSize.md, color: Colors.textPrimary },
  subject: { fontSize: FontSize.sm, color: Colors.accent, marginBottom: 4 },
  desc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  datesContainer: { gap: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.borderColor, marginBottom: 10, marginTop: 4 },
  editedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: Colors.bgSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, marginBottom: 10, borderWidth: 1, borderColor: Colors.borderColor },
  editedPillText: { fontSize: 10, color: Colors.textMuted },
  submitToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.borderColor,
  },
  submitToggleActive: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success + '40',
  },
  submitToggleText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
