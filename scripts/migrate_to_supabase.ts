import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { MOCK_USERS } from '../constants/mockData';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Use Service Role Key to bypass RLS and access admin features
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function migrate() {
  console.log('🚀 Starting User Migration to Supabase...\n');

  try {
    // 1. Create Users & Profiles
    console.log('👥 Migrating Users & Profiles...');
    for (const user of MOCK_USERS) {
      const email = `${user.roll_number.toLowerCase()}@fpi.edu`; // Fake email for Supabase Auth
      
      // Check if user exists
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('roll_number', user.roll_number).single();
      
      let authId = existingUser?.id;
      
      if (!authId) {
        // Create in Supabase Auth
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
          email: email,
          password: user.password,
          email_confirm: true,
        });

        if (authErr) {
          console.error(`  Failed to create auth user ${user.roll_number}:`, authErr.message);
          continue;
        }
        
        authId = authData.user.id;
        
        // Create Profile
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: authId,
          name: user.name,
          role: user.role,
          student_id: user.student_id,
          roll_number: user.roll_number,
          subject: user.subject,
          attendance_percent: user.attendance_percent,
          failed_subjects: user.failed_subjects || 0
        });

        if (profileErr) {
          console.error(`  Failed to insert profile ${user.roll_number}:`, profileErr.message);
        } else {
          console.log(`  ✓ Created user: ${user.name} (${user.roll_number})`);
        }
      } else {
        console.log(`  - User ${user.roll_number} already exists`);
      }
    }

    console.log('\n✅ User Migration Complete! You can now log in fresh.');

  } catch (e) {
    console.error('\n❌ Fatal Error during migration:', e);
  }
}

migrate();
