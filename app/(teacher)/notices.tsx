import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ScrollView, TextInput, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useLang } from '../../hooks/useLang';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { ActionButton } from '../../components/ui/ActionButton';
import { DeleteModal } from '../../components/ui/DeleteModal';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Notice } from '../../types';

export default function TeacherNotices() {
  const { user } = useAuth();
  const { notices, addNotice, deleteNotice } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', important: false });

  const handleSave = () => {
    if (!form.title.trim()) return;
    const now = new Date();
    const bst = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    addNotice({
      id: '',
      title: form.title.trim(),
      description: form.description.trim(),
      date: bst.toISOString().slice(0, 10),
      time: bst.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
      author: user?.name ?? '',
      important: form.important,
      created_at: now.toISOString(),
    } as Notice);
    setModalVisible(false);
    setForm({ title: '', description: '', important: false });
  };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices'} showPanelSwitch />
      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <MaterialIcons name="add" size={18} color="#fff" />
        <Text style={[styles.addBtnText, { fontFamily: FF.semiBold }]}>
          {lang === 'bn' ? 'নতুন বিজ্ঞপ্তি' : 'New Notice'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={notices}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text></View>}
        renderItem={({ item }: { item: Notice }) => (
          <Card padding={16}>
            <View style={styles.row}>
              <View style={styles.dotCol}>
                {item.important ? <View style={styles.redDot} /> : <View style={styles.grayDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTitle, { fontFamily: FF.semiBold }]}>{item.title}</Text>
                <Text style={[styles.noticeDesc, { fontFamily: FF.regular }]}>{item.description}</Text>
                <Text style={[styles.noticeMeta, { fontFamily: Fonts.en.regular }]}>{item.date} · {item.time} · {item.author}</Text>
                {item.important ? (
                  <View style={styles.importantBadge}>
                    <MaterialIcons name="priority-high" size={12} color={Colors.danger} />
                    <Text style={[styles.importantText, { fontFamily: FF.semiBold }]}>
                      {lang === 'bn' ? 'গুরুত্বপূর্ণ' : 'Important'}
                    </Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteId(item.id)}>
                <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                  {lang === 'bn' ? 'নতুন বিজ্ঞপ্তি' : 'New Notice'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'শিরোনাম' : 'Title'} *</Text>
                <TextInput
                  style={[styles.input, { fontFamily: FF.regular }]}
                  value={form.title}
                  onChangeText={v => setForm(f => ({ ...f, title: v }))}
                  placeholder={lang === 'bn' ? 'বিজ্ঞপ্তির শিরোনাম' : 'Notice title'}
                  placeholderTextColor={Colors.textMuted}
                />
                <Text style={[styles.inputLabel, { fontFamily: FF.medium }]}>{lang === 'bn' ? 'বিবরণ' : 'Description'}</Text>
                <TextInput
                  style={[styles.input, styles.multiInput, { fontFamily: FF.regular }]}
                  value={form.description}
                  onChangeText={v => setForm(f => ({ ...f, description: v }))}
                  placeholder={lang === 'bn' ? 'বিবরণ লিখুন' : 'Enter description'}
                  placeholderTextColor={Colors.textMuted}
                  multiline numberOfLines={4} textAlignVertical="top"
                />
                <View style={styles.importantRow}>
                  <View>
                    <Text style={[styles.importantRowTitle, { fontFamily: FF.semiBold }]}>
                      {lang === 'bn' ? 'গুরুত্বপূর্ণ হিসেবে চিহ্নিত করুন' : 'Mark as Important'}
                    </Text>
                    <Text style={[styles.importantRowSub, { fontFamily: FF.regular }]}>
                      {lang === 'bn' ? 'লাল ডট দিয়ে চিহ্নিত হবে' : 'Will show red dot badge'}
                    </Text>
                  </View>
                  <Switch
                    value={form.important}
                    onValueChange={v => setForm(f => ({ ...f, important: v }))}
                    trackColor={{ false: Colors.bgTertiary, true: Colors.danger + '88' }}
                    thumbColor={form.important ? Colors.danger : Colors.white}
                  />
                </View>
                <View style={styles.modalBtns}>
                  <ActionButton label={tr('cancel')} onPress={() => setModalVisible(false)} variant="secondary" style={{ flex: 1 }} />
                  <ActionButton label={tr('save')} onPress={handleSave} style={{ flex: 1 }} />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <DeleteModal
        visible={!!deleteId}
        message={lang === 'bn' ? 'আপনি কি মুছতে চান?' : 'Are you sure you want to delete?'}
        onConfirm={() => { if (deleteId) deleteNotice(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
        confirmLabel={lang === 'bn' ? 'মুছুন' : 'Delete'}
        cancelLabel={lang === 'bn' ? 'বাতিল' : 'Cancel'}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.accent, borderRadius: Radius.lg, paddingVertical: 11, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 12, alignSelf: 'flex-start' },
  addBtnText: { fontSize: FontSize.sm, color: '#fff' },
  row: { flexDirection: 'row', gap: 10 },
  dotCol: { paddingTop: 5 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  grayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.borderColor },
  noticeTitle: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 4 },
  noticeDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  noticeMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  importantBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.dangerBg, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  importantText: { fontSize: 10, color: Colors.danger },
  deleteBtn: { padding: 4 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, maxHeight: '85%', borderWidth: 1, borderColor: Colors.borderColor },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: FontSize.lg, color: Colors.textPrimary },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: Colors.bg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor, color: Colors.textPrimary, fontSize: FontSize.sm, paddingHorizontal: 12, paddingVertical: 12 },
  multiInput: { minHeight: 100, textAlignVertical: 'top', paddingTop: 10 },
  importantRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, padding: 14, marginTop: 12 },
  importantRowTitle: { fontSize: FontSize.md, color: Colors.textPrimary },
  importantRowSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 8 },
});
