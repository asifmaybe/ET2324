-- This schema maps the mock data structures to PostgreSQL for Supabase

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'teacher', 'cr')) NOT NULL,
    student_id TEXT,
    roll_number TEXT UNIQUE NOT NULL,
    subject TEXT,
    attendance_percent NUMERIC DEFAULT 0,
    failed_subjects INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Notices Table
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    author TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id),
    important BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notices are viewable by everyone." ON notices FOR SELECT USING (true);
-- Update/Insert policies would ideally be restricted to teachers or CRs.
CREATE POLICY "Teachers and CRs can insert notices" ON notices FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can update notices" ON notices FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);

-- 3. Assignments Table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('active', 'pending', 'overdue', 'completed', 'submitted')) NOT NULL,
    created_by TEXT NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Assignments viewable by everyone." ON assignments FOR SELECT USING (true);

-- 4. Exams Table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE NOT NULL,
    marks INTEGER NOT NULL,
    instructions TEXT NOT NULL,
    upcoming BOOLEAN DEFAULT true,
    created_by TEXT NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exams viewable by everyone." ON exams FOR SELECT USING (true);

-- 5. Attendance Sessions
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    time TEXT NOT NULL,
    subject TEXT NOT NULL,
    is_online_marking_active BOOLEAN DEFAULT false,
    marked_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendance sessions viewable by everyone." ON attendance_sessions FOR SELECT USING (true);

-- 6. Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('present', 'absent')) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendance records viewable by everyone." ON attendance_records FOR SELECT USING (true);

-- 7. Results Table
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    marks INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    date DATE NOT NULL,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Results viewable by everyone." ON results FOR SELECT USING (true);

-- 8. Routine Table
CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher TEXT NOT NULL,
    hall TEXT NOT NULL,
    sort_order INTEGER NOT NULL
);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Routines viewable by everyone." ON routines FOR SELECT USING (true);

-- 9. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    subject TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit logs viewable by everyone." ON audit_logs FOR SELECT USING (true);
