import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Notice } from '../../types';
import { NoticeModal } from '../../components/ui/NoticeModal';

export default function StudentNotices() {
  const { notices } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;
  
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices'} />

      <FlatList
        data={notices}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text></View>}
        renderItem={({ item }: { item: Notice }) => (
          <Card padding={16} style={{ marginBottom: 16 }}>
            <View style={styles.noticeCardTop}>
              <View style={[styles.noticeBadge, item.important && { backgroundColor: Colors.dangerLight }]}>
                <Text style={[styles.noticeBadgeText, { fontFamily: FF.medium }, item.important && { color: Colors.danger }]}>
                  {item.important 
                    ? (lang === 'bn' ? 'গুরুত্বপূর্ণ' : 'Important') 
                    : (lang === 'bn' ? 'একাডেমিক' : 'Academic')}
                </Text>
              </View>
              <TouchableOpacity style={styles.detailsBtn} onPress={() => setSelectedNotice(item)}>
                <MaterialIcons name="visibility" size={16} color={Colors.textSecondary} />
                <Text style={[styles.detailsText, { fontFamily: FF.regular }]}>
                  {lang === 'bn' ? 'বিস্তারিত দেখুন' : 'See details'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.noticeTitleLg, { fontFamily: FF.bold }]}>
              {item.title}
            </Text>
            <Text style={[styles.noticeDescLg, { fontFamily: FF.regular }]}>
              {item.description}
            </Text>

            <View style={styles.noticeDivider} />

            <View style={styles.noticeBottomRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeAuthor, { fontFamily: Fonts.en.medium }]}>
                  {item.author || 'ADMIN'}
                </Text>
                <Text style={[styles.noticeDateTime, { fontFamily: FF.regular }]}>
                  {item.date} • {item.time}
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
      
      <NoticeModal 
        visible={!!selectedNotice} 
        notice={selectedNotice} 
        onClose={() => setSelectedNotice(null)} 
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  noticeCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  noticeBadge: { backgroundColor: '#E6F0F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  noticeBadgeText: { fontSize: FontSize.xs, color: '#1A5A8A' },
  detailsBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderColor,
    backgroundColor: Colors.white 
  },
  detailsText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  noticeTitleLg: { fontSize: FontSize.md + 1, color: Colors.textPrimary, marginBottom: 8, lineHeight: 24 },
  noticeDescLg: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  noticeDivider: { height: 1, backgroundColor: Colors.borderColor, marginBottom: 12 },
  noticeBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeAuthor: { fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 2 },
  noticeDateTime: { fontSize: FontSize.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
