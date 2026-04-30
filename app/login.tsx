import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useLang } from '../hooks/useLang';
import { Colors, FontSize, Radius, Fonts } from '../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const { lang, toggleLang, tr } = useLang();
  const router = useRouter();
  const [roll, setRoll] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const handleLogin = async () => {
    if (!roll.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    const success = await login(roll.trim(), password);
    setLoading(false);
    if (success) {
      router.replace('/');
    } else {
      setError(tr('loginError'));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Top: Lang toggle */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
              <MaterialIcons name="translate" size={14} color={Colors.accent} />
              <Text style={[styles.langText, { fontFamily: FF.semiBold }]}>
                {lang === 'bn' ? 'EN' : 'বাং'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Logo + Title */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="electric-bolt" size={42} color={Colors.accent} />
            </View>
            <Text style={[styles.appTitle, { fontFamily: Fonts.en.bold }]}>Electrical 23-24</Text>
            <Text style={[styles.appSubtitle, { fontFamily: Fonts.en.regular }]}>
              College Academic Management
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Roll Number */}
            <View style={styles.fieldGroup}>
              <TextInput
                style={[styles.input, { fontFamily: FF.regular }]}
                value={roll}
                onChangeText={setRoll}
                placeholder={lang === 'bn' ? 'বোর্ড রোল (যেমন ৮৪২৯৪৩)' : 'Board Roll (e.g. 842943)'}
                placeholderTextColor={Colors.textMuted}
                keyboardType="default"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, { fontFamily: FF.regular }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                  <MaterialIcons
                    name={showPass ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={15} color={Colors.danger} />
                <Text style={[styles.errorText, { fontFamily: FF.regular }]}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.signInText, { fontFamily: FF.semiBold }]}>{tr('loginBtn')}</Text>
              )}
            </TouchableOpacity>

            {/* Forgot */}
            <Text style={[styles.forgot, { fontFamily: FF.regular }]}>
              {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন? অ্যাডমিনের সাথে যোগাযোগ করুন।' : 'Forgot password? Contact your admin.'}
            </Text>
          </View>

          {/* Demo Accounts */}
          <View style={styles.demoBox}>
            <Text style={[styles.demoTitle, { fontFamily: FF.semiBold }]}>
              {lang === 'bn' ? 'ডেমো অ্যাকাউন্ট' : 'Demo Accounts'}
            </Text>
            <Text style={[styles.demoItem, { fontFamily: Fonts.en.regular }]}>CR: 842943 / 123456</Text>
            <Text style={[styles.demoItem, { fontFamily: Fonts.en.regular }]}>Student: 842944 / 123456</Text>
            <Text style={[styles.demoItem, { fontFamily: Fonts.en.regular }]}>Teacher: T001 / 123456</Text>
          </View>

          {/* Footer */}
          <Text style={[styles.footer, { fontFamily: Fonts.en.regular }]}>
            © 2026 Electrial, FPI — Built for academic excellence.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  langToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.accentLight, borderWidth: 1, borderColor: Colors.accentMuted,
  },
  langText: { fontSize: FontSize.xs, color: Colors.accent },
  logoArea: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.borderColor,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  appTitle: { fontSize: FontSize.xxl + 2, color: Colors.textPrimary, marginBottom: 4 },
  appSubtitle: { fontSize: FontSize.md, color: Colors.textSecondary },
  formCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    padding: 20, borderWidth: 1, borderColor: Colors.borderColor,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
    marginBottom: 20,
  },
  fieldGroup: { marginBottom: 14 },
  input: {
    backgroundColor: Colors.bg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.borderColor,
    color: Colors.textPrimary, fontSize: FontSize.md,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.dangerBg, borderRadius: Radius.md,
    padding: 10, marginBottom: 14,
  },
  errorText: { fontSize: FontSize.sm, color: Colors.danger, flex: 1 },
  signInBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    paddingVertical: 15, alignItems: 'center', marginBottom: 16, marginTop: 4,
  },
  signInText: { fontSize: FontSize.md, color: '#FFFFFF', letterSpacing: 0.3 },
  forgot: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  demoBox: {
    backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 16,
    borderWidth: 1, borderColor: Colors.borderColor, marginBottom: 20,
  },
  demoTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 8 },
  demoItem: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 3, fontFamily: 'Poppins_400Regular' },
  footer: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
});
