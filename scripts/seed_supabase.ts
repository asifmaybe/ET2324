import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
  MOCK_NOTICES, 
  MOCK_ASSIGNMENTS, 
  MOCK_EXAMS, 
  MOCK_ROUTINE 
} from '../constants/mockData';

// Load environment variables from .env
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // 1. Seed Notices
    if (MOCK_NOTICES && MOCK_NOTICES.length > 0) {
      console.log('Seeding Notices...');
      const noticesToInsert = MOCK_NOTICES.map(n => ({
        id: "00000000-0000-0000-0000-" + n.id.padStart(12, '0'), // Fake UUID based on string ID
        title: n.title,
        description: n.description,
        date: n.date,
        time: n.time,
        author: n.author,
        important: n.important,
        created_at: n.created_at,
        updated_at: n.updated_at || null,
        updated_by: n.updated_by || null
      }));
      
      const { error: noticeError } = await supabase.from('notices').upsert(noticesToInsert);
      if (noticeError) console.error('Error seeding notices:', noticeError);
      else console.log(`✓ Inserted ${noticesToInsert.length} notices`);
    }

    // 2. Seed Assignments
    if (MOCK_ASSIGNMENTS && MOCK_ASSIGNMENTS.length > 0) {
      console.log('Seeding Assignments...');
      const assignmentsToInsert = MOCK_ASSIGNMENTS.map(a => ({
        id: "00000000-0000-0000-0000-" + a.id.padStart(12, '0'),
        title: a.title,
        subject: a.subject,
        description: a.description,
        assigned_date: a.assigned_date,
        due_date: a.due_date,
        status: a.status,
        created_by: a.created_by,
        updated_by: a.updated_by,
        created_at: a.created_at,
        updated_at: a.updated_at
      }));

      const { error: assignError } = await supabase.from('assignments').upsert(assignmentsToInsert);
      if (assignError) console.error('Error seeding assignments:', assignError);
      else console.log(`✓ Inserted ${assignmentsToInsert.length} assignments`);
    }

    // 3. Seed Exams
    if (MOCK_EXAMS && MOCK_EXAMS.length > 0) {
      console.log('Seeding Exams...');
      const examsToInsert = MOCK_EXAMS.map(e => ({
        id: "00000000-0000-0000-0000-" + e.id.padStart(12, '0'),
        subject: e.subject,
        type: e.type,
        date: e.date,
        marks: e.marks,
        instructions: e.instructions,
        upcoming: e.upcoming,
        created_by: e.created_by,
        updated_by: e.updated_by,
        created_at: e.created_at,
        updated_at: e.updated_at
      }));

      const { error: examError } = await supabase.from('exams').upsert(examsToInsert);
      if (examError) console.error('Error seeding exams:', examError);
      else console.log(`✓ Inserted ${examsToInsert.length} exams`);
    }

    // 4. Seed Routines
    if (MOCK_ROUTINE && MOCK_ROUTINE.length > 0) {
      console.log('Seeding Routine...');
      // UUID format needs specific hex chars, so map e.g. "s1" to standard hex
      const mapIdToUUID = (id: string) => {
        const hex = Buffer.from(id).toString('hex').padStart(12, '0');
        return `00000000-0000-0000-0000-${hex}`;
      };

      const routinesToInsert = MOCK_ROUTINE.map(r => ({
        id: mapIdToUUID(r.id),
        day: r.day,
        time_slot: r.time_slot,
        subject: r.subject,
        teacher: r.teacher,
        hall: r.hall,
        sort_order: r.sort_order
      }));

      const { error: routineError } = await supabase.from('routines').upsert(routinesToInsert);
      if (routineError) console.error('Error seeding routines:', routineError);
      else console.log(`✓ Inserted ${routinesToInsert.length} routine entries`);
    }

    console.log('\nSeed process completed!');
    console.log('Note: Profiles (users) must be created via Supabase Auth signup to generate authentic auth IDs. For now, the app will use mock profiles until we transition the auth layer.');

  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  }
}

seedDatabase();
