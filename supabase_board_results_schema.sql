-- ═══════════════════════════════════════════════════════════════════════════
-- Board Result System — Schema
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Published Semesters — which semesters have been published
CREATE TABLE IF NOT EXISTS published_semesters (
    semester_number INTEGER PRIMARY KEY,
    published_at DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE published_semesters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published_semesters_select" ON published_semesters FOR SELECT USING (true);

-- 2. Semester Results — per student per semester
CREATE TABLE IF NOT EXISTS semester_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_no TEXT NOT NULL,
    semester_number INTEGER NOT NULL REFERENCES published_semesters(semester_number),
    gpa NUMERIC,
    is_missing BOOLEAN DEFAULT false,
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE(roll_no, semester_number)
);

ALTER TABLE semester_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "semester_results_select" ON semester_results FOR SELECT USING (true);

-- 3. Referred Subjects — each failed subject per student
CREATE TABLE IF NOT EXISTS referred_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_no TEXT NOT NULL,
    semester_number INTEGER NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    subject_type TEXT NOT NULL DEFAULT 'Theory',
    cleared_in_semester INTEGER,
    UNIQUE(roll_no, subject_code, semester_number)
);

ALTER TABLE referred_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referred_subjects_select" ON referred_subjects FOR SELECT USING (true);
