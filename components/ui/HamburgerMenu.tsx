import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { useLang } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { lang, toggleLang } = useLang();
  const { logout, user, panelMode } = useAuth();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 18,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [open]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => setOpen(false));
  };

  const handleToggleLang = () => {
    toggleLang();
    handleClose();
  };

  const isTeacherPanel = user?.role === 'teacher' || (user?.role === 'cr' && panelMode === 'teacher');

  const handleAttendance = () => {
    handleClose();
    const route = isTeacherPanel ? '/(teacher)/attendance' : '/(student)/attendance';
    setTimeout(() => router.push(route as any), 150);
  };

  const handleResults = () => {
    handleClose();
    const route = isTeacherPanel ? '/(teacher)/results' : '/(student)/results';
    setTimeout(() => router.push(route as any), 150);
  };

  const handleLogout = () => {
    handleClose();
    setTimeout(() => logout(), 200);
  };

  return (
    <View>
      {/* Hamburger Button — squarish rounded */}
      <TouchableOpacity
        style={styles.hamburgerBtn}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <View style={styles.bar} />
        <View style={[styles.bar, styles.barMiddle]} />
        <View style={styles.bar} />
      </TouchableOpacity>

      {/* Dropdown Menu */}
      <Modal
        transparent
        visible={open}
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Animated.View
            style={[
              styles.menu,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
                  { translateY: scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
                ],
              },
            ]}
          >
            {/* Attendance */}
            {!isTeacherPanel ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleAttendance} activeOpacity={0.7}>
                  <View style={[styles.menuIconBg, { backgroundColor: Colors.accentLight }]}>
                    <MaterialIcons name="people" size={18} color={Colors.accent} />
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={[styles.menuLabel, { fontFamily: FF.semiBold }]}>
                      {lang === 'bn' ? 'উপস্থিতি' : 'Attendance'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider} />
              </>
            ) : null}

            {/* Results */}
            <TouchableOpacity style={styles.menuItem} onPress={handleResults} activeOpacity={0.7}>
              <View style={[styles.menuIconBg, { backgroundColor: Colors.accentLight }]}>
                <MaterialIcons name="bar-chart" size={18} color={Colors.accent} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuLabel, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'ফলাফল' : 'Results'}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Language Switcher */}
            <TouchableOpacity style={styles.menuItem} onPress={handleToggleLang} activeOpacity={0.7}>
              <View style={[styles.menuIconBg, { backgroundColor: Colors.accentLight }]}>
                <MaterialIcons name="translate" size={18} color={Colors.accent} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuLabel, { fontFamily: FF.semiBold }]}>
                  {lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন'}
                </Text>
                <Text style={[styles.menuSub, { fontFamily: Fonts.en.regular }]}>
                  {lang === 'bn' ? 'EN' : 'বাং'}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Logout */}
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
              <View style={[styles.menuIconBg, { backgroundColor: Colors.dangerLight }]}>
                <MaterialIcons name="logout" size={18} color={Colors.danger} />
              </View>
              <View style={styles.menuTextCol}>
                <Text style={[styles.menuLabel, { fontFamily: FF.semiBold, color: Colors.danger }]}>
                  {lang === 'bn' ? 'বের হন' : 'Logout'}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Hamburger button — squarish rounded ── */
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bar: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.textSecondary,
  },
  barMiddle: {
    width: 12,
  },

  /* ── Backdrop ── */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },

  /* ── Menu dropdown ── */
  menu: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingVertical: 8,
    paddingHorizontal: 6,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    gap: 12,
  },

  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuTextCol: {
    flex: 1,
  },

  menuLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  menuSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.borderColor,
    marginHorizontal: 12,
    marginVertical: 4,
  },
});
