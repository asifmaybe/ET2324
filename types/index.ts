export interface Profile {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'cr';
  student_id: string;
  roll_number: string;
  subject: string;
  attendance_percent: number;
  password: string;
  failed_subjects?: number;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  author: string;
  important: boolean;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  assigned_date: string;
  due_date: string;
  status: 'active' | 'pending' | 'overdue' | 'completed' | 'submitted';
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  subject: string;
  type: string;
  date: string;
  marks: number;
  instructions: string;
  upcoming: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  status: 'present' | 'absent';
  date: string;
  subject: string;
  remarks: string;
}

export interface AttendanceSessionRecord {
  student_id: string;
  student_name: string;
  status: 'present' | 'absent';
}

export interface AttendanceSession {
  id: string;
  date: string;
  time: string;
  subject: string;
  is_online_marking_active: boolean;
  marked_by: string;
  created_at: string;
  records: AttendanceSessionRecord[];
}

export interface Result {
  id: string;
  student_id: string;
  student_name: string;
  subject: string;
  exam_type: string;
  marks: number;
  total_marks: number;
  date: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface RoutineEntry {
  id: string;
  day: string;
  time_slot: string;
  subject: string;
  teacher: string;
  hall: string;
  sort_order: number;
}

export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  subject: string;
  details: string;
  created_at: string;
}
