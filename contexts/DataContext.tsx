import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  MOCK_ASSIGNMENTS, MOCK_EXAMS, MOCK_NOTICES, MOCK_RESULTS,
  MOCK_ATTENDANCE_SESSIONS, MOCK_AUDIT_LOG
} from '../constants/mockData';
import { Assignment, Exam, Notice, Result, AttendanceSession, AuditLog } from '../types';
import { supabase } from '../lib/supabase';

interface DataContextType {
  assignments: Assignment[];
  exams: Exam[];
  notices: Notice[];
  results: Result[];
  attendanceSessions: AttendanceSession[];
  auditLog: AuditLog[];
  addAssignment: (a: Assignment) => void;
  updateAssignment: (a: Assignment) => void;
  deleteAssignment: (id: string) => void;
  addExam: (e: Exam) => void;
  updateExam: (e: Exam) => void;
  deleteExam: (id: string) => void;
  addNotice: (n: Notice) => void;
  updateNotice: (n: Notice) => void;
  deleteNotice: (id: string) => void;
  addResult: (r: Result) => void;
  addAttendanceSession: (s: AttendanceSession) => void;
  onlineAttendanceActive: boolean;
  setOnlineAttendanceActive: (v: boolean) => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [onlineAttendanceActive, setOnlineAttendanceActive] = useState(false);

  useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const { data: noticesData, error: nErr } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
        if (!nErr && noticesData) setNotices(noticesData as Notice[]);

        const { data: assignmentsData, error: aErr } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
        if (!aErr && assignmentsData) setAssignments(assignmentsData as Assignment[]);

        const { data: examsData, error: eErr } = await supabase.from('exams').select('*').order('date', { ascending: true });
        if (!eErr && examsData) setExams(examsData as Exam[]);

        const { data: resultsData, error: rErr } = await supabase.from('results').select('*').order('uploaded_at', { ascending: false });
        if (!rErr && resultsData) setResults(resultsData as Result[]);

        const { data: auditData, error: audErr } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
        if (!audErr && auditData) setAuditLog(auditData as AuditLog[]);
      } catch (err) {
        console.warn('Failed to fetch from Supabase:', err);
      }
    }
    
    fetchFromSupabase();
  }, []);

  const addAudit = (action: string, performed_by: string, subject: string, details: string) => {
    const entry: AuditLog = { id: generateId(), action, performed_by, subject, details, created_at: new Date().toISOString() };
    setAuditLog(prev => [entry, ...prev]);
    supabase.from('audit_logs').insert([entry]).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };

  const addAssignment = (a: Assignment) => {
    const newA = { ...a, id: generateId() };
    setAssignments(prev => [newA, ...prev]);
    addAudit('Assignment Created', a.created_by, a.subject, `"${a.title}" added`);
    supabase.from('assignments').insert([newA]).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };
  const updateAssignment = (a: Assignment) => {
    setAssignments(prev => prev.map(x => x.id === a.id ? a : x));
    addAudit('Assignment Updated', a.updated_by, a.subject, `"${a.title}" updated`);
    supabase.from('assignments').update(a).eq('id', a.id).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };
  const deleteAssignment = (id: string) => {
    const a = assignments.find(x => x.id === id);
    setAssignments(prev => prev.filter(x => x.id !== id));
    if (a) addAudit('Assignment Deleted', 'Admin', a.subject, `"${a.title}" deleted`);
    supabase.from('assignments').delete().eq('id', id).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };

  const addExam = (e: Exam) => {
    const newE = { ...e, id: generateId() };
    setExams(prev => [newE, ...prev]);
    addAudit('Exam Added', e.created_by, e.subject, `${e.type} scheduled for ${e.date}`);
    supabase.from('exams').insert([newE]).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };
  const updateExam = (e: Exam) => {
    setExams(prev => prev.map(x => x.id === e.id ? e : x));
    addAudit('Exam Updated', e.updated_by, e.subject, `${e.type} on ${e.date} updated`);
    supabase.from('exams').update(e).eq('id', e.id).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };
  const deleteExam = (id: string) => {
    const e = exams.find(x => x.id === id);
    setExams(prev => prev.filter(x => x.id !== id));
    if (e) addAudit('Exam Deleted', 'Admin', e.subject, `${e.type} on ${e.date} deleted`);
    supabase.from('exams').delete().eq('id', id).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };

  const addNotice = (n: Notice) => {
    const newN = { ...n, id: generateId() };
    setNotices(prev => [newN, ...prev]);
    addAudit('Notice Posted', n.author, '-', `"${n.title}" published`);
    supabase.from('notices').insert([newN]).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };
  const updateNotice = (n: Notice) => {
    setNotices(prev => prev.map(x => x.id === n.id ? n : x));
    addAudit('Notice Updated', n.author, '-', `"${n.title}" updated`);
    supabase.from('notices').update(n).eq('id', n.id).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };
  const deleteNotice = (id: string) => {
    const n = notices.find(x => x.id === id);
    setNotices(prev => prev.filter(x => x.id !== id));
    if (n) addAudit('Notice Deleted', 'Admin', '-', `"${n.title}" removed`);
    supabase.from('notices').delete().eq('id', id).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };

  const addResult = (r: Result) => {
    const newR = { ...r, id: generateId() };
    setResults(prev => [newR, ...prev]);
    addAudit('Result Uploaded', r.uploaded_by, r.subject, `${r.exam_type} result for ${r.student_name}`);
    supabase.from('results').insert([newR]).then(({error}) => { if (error) console.warn('Supabase error', error); });
  };

  const addAttendanceSession = (s: AttendanceSession) => {
    const newS = { ...s, id: generateId() };
    setAttendanceSessions(prev => [newS, ...prev]);
    const presentCount = s.records.filter(r => r.status === 'present').length;
    const absentCount = s.records.filter(r => r.status === 'absent').length;
    addAudit('Attendance Saved', s.marked_by, s.subject, `${presentCount} present, ${absentCount} absent`);
    // Attendance session complex insert skipped for fallback
  };

  return (
    <DataContext.Provider value={{
      assignments, exams, notices, results, attendanceSessions, auditLog,
      addAssignment, updateAssignment, deleteAssignment,
      addExam, updateExam, deleteExam,
      addNotice, updateNotice, deleteNotice,
      addResult,
      addAttendanceSession,
      onlineAttendanceActive, setOnlineAttendanceActive,
    }}>
      {children}
    </DataContext.Provider>
  );
}
