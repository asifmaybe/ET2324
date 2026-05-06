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
import { NoticeModal } from '../../components/ui/NoticeModal';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Notice } from '../../types';

export default function StudentNotices() {
  const { user } = useAuth();
  const { notices, addNotice, updateNotice, deleteNotice } = useData();
  const { lang, tr } = useLang();
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', important: false });
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const openEdit = (item: Notice) => {
    setForm({ title: item.title, description: item.description, important: item.important });
    setEditingId(item.id);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setForm({ title: '', description: '', important: false });
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const now = new Date();
    const bst = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    if (editingId) {
      const existing = notices.find(n => n.id === editingId);
      if (existing) {
        updateNotice({
          ...existing,
          title: form.title.trim(),
          description: form.description.trim(),
          important: form.important,
          updated_by: user?.name ?? 'Student',
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      addNotice({
        id: '',
        title: form.title.trim(),
        description: form.description.trim(),
        date: bst.toISOString().slice(0, 10),
        time: bst.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
        author: user?.name ?? '',
        author_id: user?.id ?? '',
        important: form.important,
        created_at: now.toISOString(),
      } as Notice);
    }
    closeModal();
  };

  return (
    <ScreenWrapper scrollable={false} noPadding>
      <ScreenHeader title={lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notices'} />

      <FlatList
        data={notices}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={[styles.emptyText, { fontFamily: FF.regular }]}>{tr('noData')}</Text></View>}
        renderItem={({ item }: { item: Notice }) => {
          const canEditDelete = user?.role === 'cr' || (user?.id && user.id === item.author_id);

          return (
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.noticeDateTime, { fontFamily: FF.regular }]}>
                      {item.date} • {item.time}
                    </Text>
                    {item.updated_by ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <MaterialIcons name="edit" size={10} color={Colors.textMuted} />
                        <Text style={{ fontSize: 10, color: Colors.textMuted, fontFamily: FF.medium }}>
                          {lang === 'bn' ? 'সংশোধিত' : 'Edited'}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                {canEditDelete && (
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                      <MaterialIcons name="edit" size={18} color={Colors.info} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteId(item.id)}>
                      <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Card>
          )
        }}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setEditingId(null); setForm({ title: '', description: '', important: false }); setModalVisible(true); }} activeOpacity={0.85}>
        <MaterialIcons name="add" size={22} color="#fff" />
        <Text style={[styles.fabText, { fontFamily: FF.semiBold }]}>
          {lang === 'bn' ? 'নতুন বিজ্ঞপ্তি' : 'New Notice'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: lang === 'bn' ? Fonts.bn.bold : Fonts.en.bold }]}>
                  {editingId
                    ? (lang === 'bn' ? 'বিজ্ঞপ্তি সম্পাদনা' : 'Edit Notice')
                    : (lang === 'bn' ? 'নতুন বিজ্ঞপ্তি' : 'New Notice')}
                </Text>
                <TouchableOpacity onPress={closeModal}>
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
                  <ActionButton label={tr('cancel')} onPress={closeModal} variant="secondary" style={{ flex: 1 }} />
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

      <NoticeModal
        visible={!!selectedNotice}
        notice={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent, borderRadius: Radius.xl,
    paddingVertical: 13, paddingHorizontal: 14,
    shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  fabText: { fontSize: FontSize.md, color: '#fff' },
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
  cardActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editBtn: { padding: 8, backgroundColor: Colors.bgSecondary, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderColor },
  deleteBtn: { padding: 8, backgroundColor: Colors.dangerLight, borderRadius: Radius.md },
  editedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: Colors.bgSecondary, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8, borderWidth: 1, borderColor: Colors.borderColor },
  editedPillText: { fontSize: 10, color: Colors.textMuted },
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
