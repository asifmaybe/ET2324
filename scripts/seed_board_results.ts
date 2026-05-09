import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

// Setup supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''; // Needs to be service_role key ideally to bypass RLS, or we use a user session

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Starting Board Results Seed Process...");
  const markdownPath = path.join(__dirname, '../student_result_system.md');
  const markdownContent = fs.readFileSync(markdownPath, 'utf8');

  // We are going to parse the markdown file

  // 1. Published Semesters
  const publishedSemesters = [
    { semester_number: 1, published_at: '2025-02-15' },
    { semester_number: 2, published_at: '2025-07-20' },
    { semester_number: 3, published_at: '2026-01-10' },
    { semester_number: 4, published_at: '2026-05-01' },
  ];

  console.log("Inserting Published Semesters...");
  for (const ps of publishedSemesters) {
    await supabase.from('published_semesters').upsert(ps, { onConflict: 'semester_number' });
  }

  // Parse Student Data
  const studentBlocks = markdownContent.split('### Roll ');
  studentBlocks.shift(); // Remove the header part before the first roll

  const semesterResults: any[] = [];
  const referredSubjects: any[] = [];

  studentBlocks.forEach(block => {
    // Extract roll number
    const rollNoMatch = block.match(/^(\d+)/);
    if (!rollNoMatch) return;
    const rollNo = rollNoMatch[1];

    // Extract Semester Results
    const lines = block.split('\n');
    let inSemTable = false;
    let inRefsTable = false;

    for (let line of lines) {
      if (line.includes('| Semester | GPA | Status |')) {
        inSemTable = true;
        continue;
      }
      if (line.includes('| Code | Subject | Type | First Referred | Cleared |')) {
        inSemTable = false;
        inRefsTable = true;
        continue;
      }

      if (inSemTable && line.startsWith('| ')) {
        if (line.includes('---')) continue;
        const parts = line.split('|').map(s => s.trim());
        if (parts.length >= 4) {
          const semName = parts[1];
          const gpaStr = parts[2];
          const status = parts[3];

          let semNum = 0;
          if (semName.includes('1st')) semNum = 1;
          else if (semName.includes('2nd')) semNum = 2;
          else if (semName.includes('3rd')) semNum = 3;
          else if (semName.includes('4th')) semNum = 4;

          if (semNum > 0) {
            let gpa = null;
            let isMissing = false;

            if (gpaStr !== '—' && gpaStr !== 'Missing Result') {
              gpa = parseFloat(gpaStr);
            }
            if (status === 'Missing Result' || gpaStr === 'Missing Result') {
              isMissing = true;
            }

            semesterResults.push({
              roll_no: rollNo,
              semester_number: semNum,
              gpa: gpa,
              is_missing: isMissing,
              published_at: publishedSemesters[semNum-1].published_at
            });
          }
        }
      }

      if (inRefsTable && line.startsWith('| ')) {
        if (line.includes('---')) continue;
        const parts = line.split('|').map(s => s.trim());
        if (parts.length >= 6) {
          const code = parts[1];
          const name = parts[2];
          const type = parts[3];
          const firstRefStr = parts[4];
          const clearedStr = parts[5];

          let semNum = 0;
          if (firstRefStr.includes('1st')) semNum = 1;
          else if (firstRefStr.includes('2nd')) semNum = 2;
          else if (firstRefStr.includes('3rd')) semNum = 3;
          else if (firstRefStr.includes('4th')) semNum = 4;

          let clearedIn = null;
          if (clearedStr.includes('Cleared in')) {
            if (clearedStr.includes('1st')) clearedIn = 1;
            else if (clearedStr.includes('2nd')) clearedIn = 2;
            else if (clearedStr.includes('3rd')) clearedIn = 3;
            else if (clearedStr.includes('4th')) clearedIn = 4;
          }

          if (semNum > 0 && code.length > 0) {
            referredSubjects.push({
              roll_no: rollNo,
              semester_number: semNum,
              subject_code: code,
              subject_name: name,
              subject_type: type,
              cleared_in_semester: clearedIn
            });
          }
        }
      }
    }
  });

  console.log(`Parsed ${semesterResults.length} Semester Results and ${referredSubjects.length} Referred Subjects.`);

  // Insert in chunks to avoid large payloads
  const chunkSize = 100;
  
  console.log("Inserting Semester Results...");
  for (let i = 0; i < semesterResults.length; i += chunkSize) {
    const chunk = semesterResults.slice(i, i + chunkSize);
    const { error } = await supabase.from('semester_results').upsert(chunk, { onConflict: 'roll_no,semester_number' });
    if (error) console.error("Error inserting sem results:", error);
  }

  console.log("Inserting Referred Subjects...");
  for (let i = 0; i < referredSubjects.length; i += chunkSize) {
    const chunk = referredSubjects.slice(i, i + chunkSize);
    const { error } = await supabase.from('referred_subjects').upsert(chunk, { onConflict: 'roll_no,subject_code,semester_number' });
    if (error) console.error("Error inserting refs:", error);
  }

  console.log("Seed process completed!");
}

seed().catch(console.error);
