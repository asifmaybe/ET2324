import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { MOCK_ROUTINE } from '../../constants/mockData';

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const DAYS_BN: Record<string, string> = {
  Sunday: 'রবিবার', Monday: 'সোমবার', Tuesday: 'মঙ্গলবার',
  Wednesday: 'বুধবার', Thursday: 'বৃহস্পতিবার',
};

const SUBJECT_COLORS = [Colors.accent, Colors.info, Colors.warning, '#7C3AED', '#EC4899', Colors.danger, '#0891B2'];

function getSubjectColor(subject: string) {
  const idx = Math.abs(subject.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[idx];
}

export default function Routine() {
  const { lang } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const bstNow = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const jsDay = bstNow.getDay(); // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
  // todayDay would be null for Fri/Sat
  const defaultDay = DAYS_EN.includes(DAYS_EN[jsDay]) && jsDay <= 4 ? DAYS_EN[jsDay] : 'Sunday';
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  const dayClasses = MOCK_ROUTINE.filter(r => r.day === selectedDay).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'ক্লাস রুটিন' : 'Class Routine'} />
      <View style={styles.daySelectorWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelectorList}>
          {DAYS_EN.map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, { fontFamily: FF.medium }, selectedDay === day && styles.dayTextActive]}>
                {lang === 'bn' ? DAYS_BN[day] : day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={dayClasses}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="event-busy" size={44} color={Colors.textMuted} />
            <Text style={[styles.emptyText, { fontFamily: FF.regular }]}>
              {lang === 'bn' ? 'আজ কোনো ক্লাস নেই' : 'No classes scheduled'}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const color = getSubjectColor(item.subject);
          return (
            <View style={styles.rowItem}>
              <View style={styles.timeCol}>
                <Text style={[styles.timeText, { fontFamily: Fonts.en.medium }]}>
                  {item.time_slot.split(' - ')[0]}
                </Text>
                <View style={[styles.timeLine, index < dayClasses.length - 1 && styles.timeLineVisible]} />
              </View>
              <Card style={[styles.classCard, { borderLeftColor: color, borderLeftWidth: 3 }]} padding={14}>
                <Text style={[styles.classSubject, { fontFamily: FF.semiBold }]}>{item.subject}</Text>
                <View style={styles.classMeta}>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="access-time" size={12} color={Colors.textMuted} />
                    <Text style={[styles.metaChipText, { fontFamily: Fonts.en.regular }]}>{item.time_slot}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <MaterialIcons name="location-on" size={12} color={Colors.textMuted} />
                    <Text style={[styles.metaChipText, { fontFamily: Fonts.en.regular }]}>{item.hall}</Text>
                  </View>
                </View>
                <View style={styles.teacherRow}>
                  <MaterialIcons name="person" size={13} color={Colors.textMuted} />
                  <Text style={[styles.teacherText, { fontFamily: FF.regular }]}>{item.teacher}</Text>
                </View>
              </Card>
            </View>
          );
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  daySelectorWrap: { marginBottom: 8 },
  daySelectorList: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  dayBtn: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.borderColor,
    position: 'relative',
  },
  dayBtnActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  dayText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dayTextActive: { color: Colors.accent },
  todayDot: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.danger },
  rowItem: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  timeCol: { width: 52, alignItems: 'center', paddingTop: 14 },
  timeText: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  timeLine: { width: 1, flex: 1, marginTop: 6 },
  timeLineVisible: { backgroundColor: Colors.borderColor },
  classCard: { flex: 1, marginBottom: 12, borderRadius: Radius.lg },
  classSubject: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 8 },
  classMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.bgSecondary, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  metaChipText: { fontSize: 11, color: Colors.textSecondary },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  teacherText: { fontSize: FontSize.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
