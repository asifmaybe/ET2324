-- 1. Policies for Assignments
CREATE POLICY "Teachers and CRs can insert assignments" ON assignments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can update assignments" ON assignments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can delete assignments" ON assignments FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);

-- 2. Policies for Exams
CREATE POLICY "Teachers and CRs can insert exams" ON exams FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can update exams" ON exams FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can delete exams" ON exams FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);

-- 3. Policies for Results
CREATE POLICY "Teachers and CRs can insert results" ON results FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can update results" ON results FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can delete results" ON results FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);

-- 4. Policies for Attendance Sessions
CREATE POLICY "Teachers and CRs can insert attendance_sessions" ON attendance_sessions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can update attendance_sessions" ON attendance_sessions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);

-- 5. Policies for Attendance Records
CREATE POLICY "Teachers and CRs can insert attendance_records" ON attendance_records FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
CREATE POLICY "Teachers and CRs can update attendance_records" ON attendance_records FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);

-- 6. Policies for Audit Logs
CREATE POLICY "Teachers and CRs can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);

-- 7. Add Delete to Notices
CREATE POLICY "Teachers and CRs can delete notices" ON notices FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'cr'))
);
