import React, { createContext, useState, ReactNode } from 'react';
import {
  MOCK_ASSIGNMENTS, MOCK_EXAMS, MOCK_NOTICES, MOCK_RESULTS,
  MOCK_ATTENDANCE_SESSIONS, MOCK_AUDIT_LOG
} from '../constants/mockData';
import { Assignment, Exam, Notice, Result, AttendanceSession, AuditLog } from '../types';

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
  return Math.random().toString(36).substring(2, 10);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS);
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [results, setResults] = useState<Result[]>(MOCK_RESULTS);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(MOCK_ATTENDANCE_SESSIONS);
  const [auditLog, setAuditLog] = useState<AuditLog[]>(MOCK_AUDIT_LOG);
  const [onlineAttendanceActive, setOnlineAttendanceActive] = useState(false);

  const addAudit = (action: string, performed_by: string, subject: string, details: string) => {
    const entry: AuditLog = { id: generateId(), action, performed_by, subject, details, created_at: new Date().toISOString() };
    setAuditLog(prev => [entry, ...prev]);
  };

  const addAssignment = (a: Assignment) => {
    const newA = { ...a, id: generateId() };
    setAssignments(prev => [newA, ...prev]);
    addAudit('Assignment Created', a.created_by, a.subject, `"${a.title}" added`);
  };
  const updateAssignment = (a: Assignment) => {
    setAssignments(prev => prev.map(x => x.id === a.id ? a : x));
    addAudit('Assignment Updated', a.updated_by, a.subject, `"${a.title}" updated`);
  };
  const deleteAssignment = (id: string) => {
    const a = assignments.find(x => x.id === id);
    setAssignments(prev => prev.filter(x => x.id !== id));
    if (a) addAudit('Assignment Deleted', 'Admin', a.subject, `"${a.title}" deleted`);
  };

  const addExam = (e: Exam) => {
    const newE = { ...e, id: generateId() };
    setExams(prev => [newE, ...prev]);
    addAudit('Exam Added', e.created_by, e.subject, `${e.type} scheduled for ${e.date}`);
  };
  const updateExam = (e: Exam) => {
    setExams(prev => prev.map(x => x.id === e.id ? e : x));
    addAudit('Exam Updated', e.updated_by, e.subject, `${e.type} on ${e.date} updated`);
  };
  const deleteExam = (id: string) => {
    const e = exams.find(x => x.id === id);
    setExams(prev => prev.filter(x => x.id !== id));
    if (e) addAudit('Exam Deleted', 'Admin', e.subject, `${e.type} on ${e.date} deleted`);
  };

  const addNotice = (n: Notice) => {
    const newN = { ...n, id: generateId() };
    setNotices(prev => [newN, ...prev]);
    addAudit('Notice Posted', n.author, '-', `"${n.title}" published`);
  };
  const updateNotice = (n: Notice) => {
    setNotices(prev => prev.map(x => x.id === n.id ? n : x));
    addAudit('Notice Updated', n.author, '-', `"${n.title}" updated`);
  };
  const deleteNotice = (id: string) => {
    const n = notices.find(x => x.id === id);
    setNotices(prev => prev.filter(x => x.id !== id));
    if (n) addAudit('Notice Deleted', 'Admin', '-', `"${n.title}" removed`);
  };

  const addResult = (r: Result) => {
    const newR = { ...r, id: generateId() };
    setResults(prev => [newR, ...prev]);
    addAudit('Result Uploaded', r.uploaded_by, r.subject, `${r.exam_type} result for ${r.student_name}`);
  };

  const addAttendanceSession = (s: AttendanceSession) => {
    const newS = { ...s, id: generateId() };
    setAttendanceSessions(prev => [newS, ...prev]);
    const presentCount = s.records.filter(r => r.status === 'present').length;
    const absentCount = s.records.filter(r => r.status === 'absent').length;
    addAudit('Attendance Saved', s.marked_by, s.subject, `${presentCount} present, ${absentCount} absent`);
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
