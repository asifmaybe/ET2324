import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, FontSize, Spacing } from '../../constants/theme';
import { ActionButton } from './ActionButton';

interface Props {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function DeleteModal({ visible, message, onConfirm, onCancel, confirmLabel = 'Delete', cancelLabel = 'Cancel', confirmVariant = 'danger' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.msg}>{message}</Text>
          <View style={styles.row}>
            <ActionButton label={cancelLabel} onPress={onCancel} variant="secondary" style={styles.btn} />
            <ActionButton label={confirmLabel} onPress={onConfirm} variant={confirmVariant} style={styles.btn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: 24 },
  box: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xxl, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: Colors.borderColor, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
  msg: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: Spacing.xl, textAlign: 'center', lineHeight: 24, fontFamily: 'Poppins_400Regular' },
  row: { flexDirection: 'row', gap: Spacing.md },
  btn: { flex: 1 },
});
