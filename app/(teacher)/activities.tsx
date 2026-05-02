import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLang } from '../../hooks/useLang';
import { useData } from '../../hooks/useData';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';

export default function ActivitiesScreen() {
  const { lang } = useLang();
  const { auditLog } = useData();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader 
        title={lang === 'bn' ? 'সকল কার্যকলাপ' : 'All Activities'} 
        showBack={true} 
      />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.title, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
          {lang === 'bn' ? 'অ্যাক্টিভিটি লগ' : 'Activity Log'}
        </Text>
        
        {auditLog.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="history" size={48} color={Colors.textMuted} />
            <Text style={[styles.emptyText, { fontFamily: FF.medium }]}>
              {lang === 'bn' ? 'কোন কার্যকলাপ নেই' : 'No activity found'}
            </Text>
          </View>
        ) : (
          auditLog.map(log => (
            <Card key={log.id} padding={16} style={{ marginBottom: 12 }}>
              <View style={styles.logRow}>
                <View style={styles.logIcon}>
                  <MaterialIcons name="access-time" size={18} color={Colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.logAction, { fontFamily: Fonts.en.semiBold }]}>
                    {log.action}
                  </Text>
                  <Text style={[styles.logDetails, { fontFamily: FF.regular }]}>
                    {log.details}
                  </Text>
                  <Text style={[styles.logMeta, { fontFamily: Fonts.en.regular }]}>
                    {log.performed_by} · {new Date(log.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: 16, paddingBottom: 24 },
  title: {
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  logRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  logIcon: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: Colors.bgSecondary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  logAction: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 4 },
  logDetails: { fontSize: FontSize.sm, color: Colors.accent, marginBottom: 6 },
  logMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
});
