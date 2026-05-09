import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Colors, FontSize, Radius, Fonts } from '../../constants/theme';
import { useLang } from '../../hooks/useLang';
import { supabase } from '../../lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';

export default function PublishBoard() {
  const router = useRouter();
  const { lang } = useLang();
  const [jsonText, setJsonText] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const FF = lang === 'bn' ? Fonts.bn : Fonts.en;

  const handlePublish = async () => {
    if (!jsonText.trim()) {
      Alert.alert(lang === 'bn' ? 'ত্রুটি' : 'Error', lang === 'bn' ? 'অনুগ্রহ করে JSON পেস্ট করুন' : 'Please paste the JSON payload');
      return;
    }

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      Alert.alert(lang === 'bn' ? 'অবৈধ JSON' : 'Invalid JSON', lang === 'bn' ? 'আপনার JSON ফরম্যাটটি সঠিক নয়।' : 'The JSON format is invalid.');
      return;
    }

    const semNum = data.semester_number;
    if (!semNum || !data.published_at || !data.students) {
      Alert.alert(lang === 'bn' ? 'অসম্পূর্ণ ডেটা' : 'Incomplete Data', lang === 'bn' ? 'semester_number, published_at এবং students ফিল্ড থাকা আবশ্যক।' : 'Must have semester_number, published_at, and students array.');
      return;
    }

    Alert.alert(
      lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm',
      lang === 'bn' ? `আপনি কি ${semNum} সেমিস্টারের ফলাফল প্রকাশ করতে চান?` : `Are you sure you want to publish the results for Semester ${semNum}?`,
      [
        { text: lang === 'bn' ? 'বাতিল' : 'Cancel', style: 'cancel' },
        { 
          text: lang === 'bn' ? 'প্রকাশ করুন' : 'Publish', 
          style: 'destructive',
          onPress: () => processPublishing(data, semNum)
        }
      ]
    );
  };

  const processPublishing = async (data: any, semNum: number) => {
    setIsPublishing(true);
    try {
      // 1. Insert/Update the published semester
      const { error: semError } = await supabase.from('published_semesters').upsert({
        semester_number: semNum,
        published_at: data.published_at
      }, { onConflict: 'semester_number' });
      
      if (semError) throw semError;

      // Prepare arrays for bulk operations
      const semesterResults = [];
      const newReferredSubjects = [];

      for (const student of data.students) {
        // Collect GPAs
        semesterResults.push({
          roll_no: student.roll_no,
          semester_number: semNum,
          gpa: student.gpa,
          is_missing: student.is_missing || false,
          published_at: data.published_at
        });

        // Collect new referred subjects
        if (student.new_referred_subjects && student.new_referred_subjects.length > 0) {
          for (const ref of student.new_referred_subjects) {
            newReferredSubjects.push({
              roll_no: student.roll_no,
              semester_number: semNum,
              subject_code: ref.code,
              subject_name: ref.name,
              subject_type: ref.type || 'Theory',
              cleared_in_semester: null
            });
          }
        }

        // Process CLEARED subjects (Rule 2)
        if (student.cleared_subject_codes && student.cleared_subject_codes.length > 0) {
          for (const code of student.cleared_subject_codes) {
            await supabase.from('referred_subjects')
              .update({ cleared_in_semester: semNum })
              .eq('roll_no', student.roll_no)
              .eq('subject_code', code)
              .is('cleared_in_semester', null);
          }
        }
      }

      // Bulk Insert GPAs
      if (semesterResults.length > 0) {
        const { error: gpaError } = await supabase.from('semester_results').upsert(semesterResults, { onConflict: 'roll_no,semester_number' });
        if (gpaError) throw gpaError;
      }

      // Bulk Insert New Referred Subjects
      if (newReferredSubjects.length > 0) {
        const { error: refError } = await supabase.from('referred_subjects').upsert(newReferredSubjects, { onConflict: 'roll_no,subject_code,semester_number' });
        if (refError) throw refError;
      }

      Alert.alert(
        lang === 'bn' ? 'সফল!' : 'Success!',
        lang === 'bn' ? `${semNum} সেমিস্টারের ফলাফল সফলভাবে প্রকাশিত হয়েছে!` : `Semester ${semNum} results have been published successfully!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.warn('Publish error:', err);
      Alert.alert('Error', err.message || 'An error occurred while publishing.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title={lang === 'bn' ? 'ফলাফল প্রকাশ করুন' : 'Publish Results'} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={24} color={Colors.info} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { fontFamily: FF.semiBold }]}>
              {lang === 'bn' ? 'অ্যাডমিন অ্যাক্সেস' : 'Admin Access Only'}
            </Text>
            <Text style={[styles.infoDesc, { fontFamily: FF.regular }]}>
              {lang === 'bn' 
                ? 'বোর্ড ফলাফল প্রকাশ করতে সঠিক ফরম্যাটের JSON ডেটা নিচে পেস্ট করুন। এটি স্বয়ংক্রিয়ভাবে ডেটাবেস আপডেট করবে।' 
                : 'Paste the properly formatted JSON payload below to publish the board results. This will instantly update the database.'}
            </Text>
          </View>
        </View>

        <Text style={[styles.label, { fontFamily: FF.semiBold }]}>
          {lang === 'bn' ? 'JSON পেলোড' : 'JSON Payload'}
        </Text>
        <TextInput
          style={[styles.input, { fontFamily: Fonts.en.regular }]}
          multiline
          placeholder={`{\n  "semester_number": 5,\n  "published_at": "2026-10-25",\n  "students": [...]\n}`}
          placeholderTextColor={Colors.textMuted}
          value={jsonText}
          onChangeText={setJsonText}
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={[styles.publishBtn, isPublishing && { opacity: 0.7 }]} 
          onPress={handlePublish}
          disabled={isPublishing}
          activeOpacity={0.8}
        >
          {isPublishing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={20} color={Colors.white} />
              <Text style={[styles.publishBtnText, { fontFamily: FF.bold }]}>
                {lang === 'bn' ? 'প্রকাশ করুন' : 'Publish Results'}
              </Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.infoBg,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 24
  },
  infoTitle: { fontSize: FontSize.md, color: Colors.info, marginBottom: 4 },
  infoDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  label: { fontSize: FontSize.md, color: Colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: Radius.md,
    padding: 16,
    height: 400,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  publishBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  publishBtnText: {
    color: Colors.white,
    fontSize: FontSize.md + 1,
  }
});
