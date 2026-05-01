import { Assignment, Exam, AttendanceRecord, Result, Notice, RoutineEntry, AuditLog, AttendanceSession, Profile } from '../types';

export const SUBJECTS = [
  'Generation of Electrical Power',
  'Principle of Marketing',
  'Industrial Management',
  'Electrical & Electronic Measurement-I',
  'Testing & Maintenance of Electrical Equipment',
  'Electrical Engineering Project-II',
  'Microprocessor & Microcontroller',
];

export const SUBJECT_SHORT: Record<string, string> = {
  'Generation of Electrical Power': 'MH',
  'Principle of Marketing': 'E.Hq',
  'Industrial Management': 'E.Hq',
  'Electrical & Electronic Measurement-I': 'EH',
  'Testing & Maintenance of Electrical Equipment': 'RK',
  'Electrical Engineering Project-II': 'RI',
  'Microprocessor & Microcontroller': 'RK',
};

export const MOCK_USERS: Profile[] = [
  { id: '1', name: 'Md. Mosharrof Hosen', role: 'teacher', student_id: '', roll_number: 'T001', subject: 'Generation of Electrical Power', attendance_percent: 0, password: '123456' },
  { id: '2', name: 'Md. Emarat Hossain', role: 'teacher', student_id: '', roll_number: 'T002', subject: 'Electrical & Electronic Measurement-I', attendance_percent: 0, password: '123456' },
  { id: '3', name: 'SUMON AHMED', role: 'cr', student_id: 'S001', roll_number: '842943', subject: '', attendance_percent: 88, password: '123456' },
  { id: '4', name: 'TANVIR HOSSAIN', role: 'student', student_id: 'S002', roll_number: '842944', subject: '', attendance_percent: 92, password: '123456' },
  { id: '5', name: 'RAKIBUL HASAN', role: 'student', student_id: 'S003', roll_number: '842945', subject: '', attendance_percent: 75, password: '123456' },
  { id: '6', name: 'MEHEDI HASSAN', role: 'student', student_id: 'S004', roll_number: '842946', subject: '', attendance_percent: 83, password: '123456' },
  { id: '7', name: 'FARHAN KABIR', role: 'student', student_id: 'S005', roll_number: '842947', subject: '', attendance_percent: 90, password: '123456' },
  { id: '8', name: 'SABBIR RAHMAN', role: 'student', student_id: 'S006', roll_number: '842948', subject: '', attendance_percent: 67, password: '123456' },
  { id: '9', name: 'NAHID HOSSAIN', role: 'student', student_id: 'S007', roll_number: '842949', subject: '', attendance_percent: 95, password: '123456' },
  { id: '10', name: 'ARIF BILLAH', role: 'student', student_id: 'S008', roll_number: '842950', subject: '', attendance_percent: 78, password: '123456' },
];

export const MOCK_NOTICES: Notice[] = [
  { id: '1', title: 'Class Test Notice', description: 'Class test on Generation of Electrical Power on 5th May. Syllabus: Chapter 1-3.', date: '2026-04-30', time: '10:33 PM', author: 'AMIR HAMZA', important: true, created_at: '2026-04-30T16:33:00Z' },
  { id: '2', title: 'Holiday Notice', description: 'Classes will remain suspended on 1st May due to May Day. Classes will resume on 2nd May lorem saffrg jsd fdsdsfds dsgdsfgfdg   dsfsd dsf sds  g dsgds gsds f  ds ds fdsfsdf sd ds fdsf  f dsfdsf f  df gd gdgd  s sdfds.', date: '2026-04-29', time: '9:00 AM', author: 'AMIR HAMZA', important: false, created_at: '2026-04-29T03:00:00Z' },
  { id: '3', title: 'Project Submission Reminder', description: 'Electrical Engineering Project-II final report must be submitted by 15th May. Late submission will not be accepted.', date: '2026-04-28', time: '2:15 PM', author: 'RAFIQUL ISLAM', important: true, created_at: '2026-04-28T08:15:00Z' },
  { id: '4', title: 'Lab Schedule Updated', description: 'The Microprocessor lab schedule has been updated. Please check the new routine posted on the notice board.', date: '2026-04-25', time: '11:00 AM', author: 'AMIR HAMZA', important: false, created_at: '2026-04-25T05:00:00Z' },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: 'Power Generation Report', subject: 'Generation of Electrical Power', description: 'Write a detailed report on thermal power plant operations and efficiency calculations.', assigned_date: '2026-04-20', due_date: '2026-05-05', status: 'active', created_by: 'AMIR HAMZA', updated_by: 'AMIR HAMZA', created_at: '2026-04-20T09:00:00Z', updated_at: '2026-04-20T09:00:00Z' },
  { id: '2', title: 'Marketing Plan', subject: 'Principle of Marketing', description: 'Develop a marketing plan for a hypothetical electrical equipment company.', assigned_date: '2026-04-18', due_date: '2026-04-28', status: 'overdue', created_by: 'AMIR HAMZA', updated_by: 'AMIR HAMZA', created_at: '2026-04-18T09:00:00Z', updated_at: '2026-04-18T09:00:00Z' },
  { id: '3', title: 'Microcontroller Program', subject: 'Microprocessor & Microcontroller', description: 'Write an 8051 assembly program to interface a 7-segment display.', assigned_date: '2026-04-22', due_date: '2026-05-10', status: 'active', created_by: 'RAFIQUL ISLAM', updated_by: 'RAFIQUL ISLAM', created_at: '2026-04-22T09:00:00Z', updated_at: '2026-04-22T09:00:00Z' },
  { id: '4', title: 'Industrial Visit Report', subject: 'Industrial Management', description: 'Prepare a report on the industrial visit to the Ashuganj Power Station.', assigned_date: '2026-04-10', due_date: '2026-04-20', status: 'submitted', created_by: 'AMIR HAMZA', updated_by: 'AMIR HAMZA', created_at: '2026-04-10T09:00:00Z', updated_at: '2026-04-10T09:00:00Z' },
  { id: '5', title: 'Oscilloscope Experiment', subject: 'Electronic Measurement', description: 'Perform CRO experiments and document waveform analysis with calculations.', assigned_date: '2026-04-25', due_date: '2026-05-08', status: 'pending', created_by: 'RAFIQUL ISLAM', updated_by: 'RAFIQUL ISLAM', created_at: '2026-04-25T09:00:00Z', updated_at: '2026-04-25T09:00:00Z' },
  { id: '6', title: 'Project Progress Report', subject: 'Electrical Engineering Project-II', description: 'Submit 30% completion report with circuit diagrams and component list.', assigned_date: '2026-04-15', due_date: '2026-04-30', status: 'active', created_by: 'AMIR HAMZA', updated_by: 'AMIR HAMZA', created_at: '2026-04-15T09:00:00Z', updated_at: '2026-04-15T09:00:00Z' },
];

export const MOCK_EXAMS: Exam[] = [
  { id: '1', subject: 'Generation of Electrical Power', type: 'Class Test', date: '2026-05-05', marks: 20, instructions: 'Chapter 1-3. Open book not allowed. Bring scientific calculator.', upcoming: true, created_by: 'AMIR HAMZA', updated_by: 'AMIR HAMZA', created_at: '2026-04-28T09:00:00Z', updated_at: '2026-04-28T09:00:00Z' },
  { id: '2', subject: 'Electronic Measurement', type: 'Quiz', date: '2026-05-07', marks: 10, instructions: 'MCQ quiz. 15 minutes. Covers Chapter 4-5.', upcoming: true, created_by: 'RAFIQUL ISLAM', updated_by: 'RAFIQUL ISLAM', created_at: '2026-04-29T09:00:00Z', updated_at: '2026-04-29T09:00:00Z' },
  { id: '3', subject: 'Microprocessor & Microcontroller', type: 'Mid-Term', date: '2026-05-15', marks: 50, instructions: 'Full syllabus up to Chapter 6. Practical questions included.', upcoming: true, created_by: 'RAFIQUL ISLAM', updated_by: 'RAFIQUL ISLAM', created_at: '2026-04-27T09:00:00Z', updated_at: '2026-04-27T09:00:00Z' },
  { id: '4', subject: 'Industrial Management', type: 'Class Test', date: '2026-04-15', marks: 20, instructions: 'Chapter 1-2. Definitions and short questions.', upcoming: false, created_by: 'AMIR HAMZA', updated_by: 'AMIR HAMZA', created_at: '2026-04-10T09:00:00Z', updated_at: '2026-04-10T09:00:00Z' },
  { id: '5', subject: 'Principle of Marketing', type: 'Quiz', date: '2026-04-10', marks: 10, instructions: 'MCQ. Marketing concepts and principles.', upcoming: false, created_by: 'AMIR HAMZA', updated_by: 'AMIR HAMZA', created_at: '2026-04-05T09:00:00Z', updated_at: '2026-04-05T09:00:00Z' },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', session_id: 'ses1', student_id: 'S001', student_name: 'SUMON AHMED', status: 'present', date: '2026-04-30', subject: 'Generation of Electrical Power', remarks: '' },
  { id: '2', session_id: 'ses1', student_id: 'S001', student_name: 'SUMON AHMED', status: 'present', date: '2026-04-29', subject: 'Electronic Measurement', remarks: '' },
  { id: '3', session_id: 'ses2', student_id: 'S001', student_name: 'SUMON AHMED', status: 'absent', date: '2026-04-28', subject: 'Industrial Management', remarks: '' },
  { id: '4', session_id: 'ses3', student_id: 'S001', student_name: 'SUMON AHMED', status: 'late', date: '2026-04-27', subject: 'Microprocessor & Microcontroller', remarks: '10 min late' },
  { id: '5', session_id: 'ses4', student_id: 'S001', student_name: 'SUMON AHMED', status: 'present', date: '2026-04-26', subject: 'Principle of Marketing', remarks: '' },
  { id: '6', session_id: 'ses5', student_id: 'S001', student_name: 'SUMON AHMED', status: 'present', date: '2026-04-24', subject: 'Testing & Maintenance of Electrical Equipment', remarks: '' },
  { id: '7', session_id: 'ses6', student_id: 'S001', student_name: 'SUMON AHMED', status: 'present', date: '2026-04-23', subject: 'Electrical Engineering Project-II', remarks: '' },
  { id: '8', session_id: 'ses7', student_id: 'S001', student_name: 'SUMON AHMED', status: 'absent', date: '2026-04-22', subject: 'Generation of Electrical Power', remarks: '' },
  { id: '9', session_id: 'ses8', student_id: 'S001', student_name: 'SUMON AHMED', status: 'present', date: '2026-04-21', subject: 'Electronic Measurement', remarks: '' },
  { id: '10', session_id: 'ses9', student_id: 'S001', student_name: 'SUMON AHMED', status: 'present', date: '2026-04-20', subject: 'Industrial Management', remarks: '' },
];

export const MOCK_RESULTS: Result[] = [
  { id: '1', student_id: 'S001', student_name: 'SUMON AHMED', subject: 'Industrial Management', exam_type: 'Class Test', marks: 17, total_marks: 20, date: '2026-04-15', uploaded_by: 'AMIR HAMZA', uploaded_at: '2026-04-16T09:00:00Z' },
  { id: '2', student_id: 'S001', student_name: 'SUMON AHMED', subject: 'Principle of Marketing', exam_type: 'Quiz', marks: 8, total_marks: 10, date: '2026-04-10', uploaded_by: 'AMIR HAMZA', uploaded_at: '2026-04-11T09:00:00Z' },
  { id: '3', student_id: 'S002', student_name: 'TANVIR HOSSAIN', subject: 'Industrial Management', exam_type: 'Class Test', marks: 15, total_marks: 20, date: '2026-04-15', uploaded_by: 'AMIR HAMZA', uploaded_at: '2026-04-16T09:00:00Z' },
  { id: '4', student_id: 'S003', student_name: 'RAKIBUL HASAN', subject: 'Industrial Management', exam_type: 'Class Test', marks: 12, total_marks: 20, date: '2026-04-15', uploaded_by: 'AMIR HAMZA', uploaded_at: '2026-04-16T09:00:00Z' },
  { id: '5', student_id: 'S004', student_name: 'MEHEDI HASSAN', subject: 'Industrial Management', exam_type: 'Class Test', marks: 18, total_marks: 20, date: '2026-04-15', uploaded_by: 'AMIR HAMZA', uploaded_at: '2026-04-16T09:00:00Z' },
  { id: '6', student_id: 'S001', student_name: 'SUMON AHMED', subject: 'Electronic Measurement', exam_type: 'Class Test', marks: 16, total_marks: 20, date: '2026-04-20', uploaded_by: 'RAFIQUL ISLAM', uploaded_at: '2026-04-21T09:00:00Z' },
];

export const MOCK_ROUTINE: RoutineEntry[] = [
  // Sunday
  { id: 's1', day: 'Sunday', time_slot: '8:00 - 8:45', subject: 'Generation of Electrical Power', teacher: 'Md. Mosharrof Hosen', hall: 'COM 405', sort_order: 1 },
  { id: 's2', day: 'Sunday', time_slot: '8:45 - 9:30', subject: 'Principle of Marketing', teacher: 'Emdadul Hoque', hall: 'COM 405', sort_order: 2 },
  { id: 's3', day: 'Sunday', time_slot: '9:30 - 10:15', subject: 'Industrial Management', teacher: 'Emdadul Hoque', hall: 'COM 405', sort_order: 3 },
  { id: 's4', day: 'Sunday', time_slot: '11:00 - 11:45', subject: 'Electrical & Electronic Measurement-I', teacher: 'Md. Emarat Hossain', hall: 'EMS', sort_order: 4 },
  { id: 's5', day: 'Sunday', time_slot: '12:30 - 1:15', subject: 'Testing & Maintenance of Electrical Equipment', teacher: 'Razaul Karim', hall: 'EMS', sort_order: 5 },
  // Monday
  { id: 'm1', day: 'Monday', time_slot: '8:45 - 9:30', subject: 'Electrical Engineering Project-II', teacher: 'Rakibul Islam', hall: 'EMS', sort_order: 1 },
  { id: 'm2', day: 'Monday', time_slot: '10:15 - 11:00', subject: 'Generation of Electrical Power', teacher: 'Md. Mosharrof Hosen', hall: 'EMS', sort_order: 2 },
  { id: 'm3', day: 'Monday', time_slot: '11:45 - 12:30', subject: 'Generation of Electrical Power', teacher: 'Md. Mosharrof Hosen', hall: 'EPS', sort_order: 3 },
  // Tuesday
  { id: 't1', day: 'Tuesday', time_slot: '8:00 - 8:45', subject: 'Testing & Maintenance of Electrical Equipment', teacher: 'Razaul Karim', hall: 'EPS', sort_order: 1 },
  { id: 't2', day: 'Tuesday', time_slot: '9:30 - 10:15', subject: 'Microprocessor & Microcontroller', teacher: 'Razaul Karim', hall: 'EPS', sort_order: 2 },
  { id: 't3', day: 'Tuesday', time_slot: '11:00 - 11:45', subject: 'Principle of Marketing', teacher: 'Emdadul Hoque', hall: 'COM 405', sort_order: 3 },
  { id: 't4', day: 'Tuesday', time_slot: '11:45 - 12:30', subject: 'Microprocessor & Microcontroller', teacher: 'Razaul Karim', hall: 'COM 405', sort_order: 4 },
  { id: 't5', day: 'Tuesday', time_slot: '12:30 - 1:15', subject: 'Electrical & Electronic Measurement-I', teacher: 'Md. Emarat Hossain', hall: 'COM 405', sort_order: 5 },
  // Wednesday
  { id: 'w1', day: 'Wednesday', time_slot: '8:45 - 9:30', subject: 'Industrial Management', teacher: 'Emdadul Hoque', hall: 'COM 401', sort_order: 1 },
  { id: 'w2', day: 'Wednesday', time_slot: '9:30 - 10:15', subject: 'Generation of Electrical Power', teacher: 'Md. Mosharrof Hosen', hall: 'COM 401', sort_order: 2 },
  { id: 'w3', day: 'Wednesday', time_slot: '11:00 - 11:45', subject: 'Electrical Engineering Project-II', teacher: 'Rakibul Islam', hall: 'EMS', sort_order: 3 },
  { id: 'w4', day: 'Wednesday', time_slot: '12:30 - 1:15', subject: 'Microprocessor & Microcontroller', teacher: 'Razaul Karim', hall: 'EMS', sort_order: 4 },
  // Thursday
  { id: 'th1', day: 'Thursday', time_slot: '9:30 - 10:15', subject: 'Electrical & Electronic Measurement-I', teacher: 'Md. Emarat Hossain', hall: 'EPS', sort_order: 1 },
  { id: 'th2', day: 'Thursday', time_slot: '11:00 - 11:45', subject: 'Testing & Maintenance of Electrical Equipment', teacher: 'Razaul Karim', hall: 'EMS', sort_order: 2 },
  { id: 'th3', day: 'Thursday', time_slot: '12:30 - 1:15', subject: 'Microprocessor & Microcontroller', teacher: 'Razaul Karim', hall: 'EMS', sort_order: 3 },
];

export const MOCK_AUDIT_LOG: AuditLog[] = [
  { id: '1', action: 'Assignment Created', performed_by: 'AMIR HAMZA', subject: 'Generation of Electrical Power', details: 'Power Generation Report added', created_at: '2026-04-30T09:00:00Z' },
  { id: '2', action: 'Attendance Saved', performed_by: 'RAFIQUL ISLAM', subject: 'Electronic Measurement', details: '25 students marked, 3 absent', created_at: '2026-04-29T11:00:00Z' },
  { id: '3', action: 'Notice Posted', performed_by: 'AMIR HAMZA', subject: '-', details: 'Class Test Notice published', created_at: '2026-04-29T08:30:00Z' },
  { id: '4', action: 'Result Uploaded', performed_by: 'RAFIQUL ISLAM', subject: 'Electronic Measurement', details: 'Class Test results for 8 students', created_at: '2026-04-28T14:00:00Z' },
  { id: '5', action: 'Exam Added', performed_by: 'AMIR HAMZA', subject: 'Generation of Electrical Power', details: 'Class Test scheduled for May 5', created_at: '2026-04-28T10:00:00Z' },
];

export const ALL_STUDENTS = MOCK_USERS.filter(u => u.role === 'student' || u.role === 'cr');

export const MOCK_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  {
    id: 'ses1', date: '2026-04-30', time: '8:00 AM', subject: 'Generation of Electrical Power',
    is_online_marking_active: false, marked_by: 'AMIR HAMZA', created_at: '2026-04-30T02:00:00Z',
    records: [
      { student_id: '842943', student_name: 'SUMON AHMED', status: 'present' },
      { student_id: '842944', student_name: 'TANVIR HOSSAIN', status: 'present' },
      { student_id: '842945', student_name: 'RAKIBUL HASAN', status: 'absent' },
      { student_id: '842946', student_name: 'MEHEDI HASSAN', status: 'late' },
      { student_id: '842947', student_name: 'FARHAN KABIR', status: 'present' },
      { student_id: '842948', student_name: 'SABBIR RAHMAN', status: 'absent' },
      { student_id: '842949', student_name: 'NAHID HOSSAIN', status: 'present' },
      { student_id: '842950', student_name: 'ARIF BILLAH', status: 'present' },
    ]
  },
  {
    id: 'ses2', date: '2026-04-29', time: '9:00 AM', subject: 'Electronic Measurement',
    is_online_marking_active: false, marked_by: 'RAFIQUL ISLAM', created_at: '2026-04-29T03:00:00Z',
    records: [
      { student_id: '842943', student_name: 'SUMON AHMED', status: 'present' },
      { student_id: '842944', student_name: 'TANVIR HOSSAIN', status: 'present' },
      { student_id: '842945', student_name: 'RAKIBUL HASAN', status: 'present' },
      { student_id: '842946', student_name: 'MEHEDI HASSAN', status: 'absent' },
      { student_id: '842947', student_name: 'FARHAN KABIR', status: 'present' },
    ]
  },
];
