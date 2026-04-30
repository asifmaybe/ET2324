export type Lang = 'en' | 'bn';

export const T = {
  // App
  appName: { en: 'ET 23-24', bn: 'ET 23-24' },
  dept: { en: 'Electrical Department', bn: 'বৈদ্যুতিক বিভাগ' },
  batch: { en: 'Batch 2023-2024', bn: 'ব্যাচ ২০২৩-২০২৪' },

  // Auth
  login: { en: 'Login', bn: 'লগইন' },
  rollNumber: { en: 'Board Roll Number', bn: 'বোর্ড রোল নম্বর' },
  password: { en: 'Password', bn: 'পাসওয়ার্ড' },
  loginBtn: { en: 'Sign In', bn: 'প্রবেশ করুন' },
  loginError: { en: 'Invalid roll number or password', bn: 'ভুল রোল নম্বর বা পাসওয়ার্ড' },
  loggingIn: { en: 'Signing in...', bn: 'প্রবেশ করছি...' },
  logout: { en: 'Logout', bn: 'বের হন' },

  // Roles
  student: { en: 'Student', bn: 'শিক্ষার্থী' },
  teacher: { en: 'Teacher', bn: 'শিক্ষক' },
  cr: { en: 'Class Representative', bn: 'ক্লাস প্রতিনিধি' },

  // Panels
  studentPanel: { en: 'Student Panel', bn: 'শিক্ষার্থী প্যানেল' },
  teacherPanel: { en: 'Teacher Panel', bn: 'শিক্ষক প্যানেল' },
  switchToTeacher: { en: 'Switch to Teacher', bn: 'শিক্ষক মোডে যান' },
  switchToStudent: { en: 'Switch to Student', bn: 'শিক্ষার্থী মোডে যান' },

  // Nav Labels (Student)
  navDashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  navAssignments: { en: 'Tasks', bn: 'কাজ' },
  navExams: { en: 'Exams', bn: 'পরীক্ষা' },
  navAttendance: { en: 'Attendance', bn: 'উপস্থিতি' },
  navResults: { en: 'Results', bn: 'ফলাফল' },
  navRoutine: { en: 'Routine', bn: 'রুটিন' },
  navNotices: { en: 'Notices', bn: 'বিজ্ঞপ্তি' },

  // Dashboard
  welcome: { en: 'Welcome back', bn: 'স্বাগতম' },
  pendingAssignments: { en: 'Pending Tasks', bn: 'বকেয়া কাজ' },
  upcomingExams: { en: 'Upcoming Exams', bn: 'আসন্ন পরীক্ষা' },
  attendance: { en: 'Attendance', bn: 'উপস্থিতি' },
  thisMonth: { en: 'This Month', bn: 'এই মাসে' },
  overdue: { en: 'Overdue', bn: 'মেয়াদোত্তীর্ণ' },
  seeAll: { en: 'See All', bn: 'সব দেখুন' },
  notices: { en: 'Notices', bn: 'বিজ্ঞপ্তি' },
  nextSession: { en: 'Next Session', bn: 'পরবর্তী ক্লাস' },
  happeningNow: { en: 'Happening Now', bn: 'এখন চলছে' },
  happeningSoon: { en: 'Starting Soon', bn: 'শীঘ্রই শুরু' },
  nextClass: { en: 'Next Class', bn: 'পরবর্তী ক্লাস' },
  resumesTomorrow: { en: 'Resumes Tomorrow', bn: 'আগামীকাল শুরু' },
  noClass: { en: 'No more classes today', bn: 'আজ আর ক্লাস নেই' },
  quickActions: { en: 'Quick Actions', bn: 'দ্রুত কাজ' },
  overview: { en: 'Overview', bn: 'সারসংক্ষেপ' },
  recentActivity: { en: 'Recent Activity', bn: 'সাম্প্রতিক কার্যক্রম' },

  // Assignments
  assignments: { en: 'Assignments', bn: 'অ্যাসাইনমেন্ট' },
  manageAssignments: { en: 'Manage Assignments', bn: 'অ্যাসাইনমেন্ট ব্যবস্থাপনা' },
  addAssignment: { en: 'Add Assignment', bn: 'অ্যাসাইনমেন্ট যোগ করুন' },
  editAssignment: { en: 'Edit Assignment', bn: 'সম্পাদনা করুন' },
  deleteAssignment: { en: 'Delete', bn: 'মুছুন' },
  title: { en: 'Title', bn: 'শিরোনাম' },
  subject: { en: 'Subject', bn: 'বিষয়' },
  description: { en: 'Description', bn: 'বিবরণ' },
  dueDate: { en: 'Due Date', bn: 'জমার তারিখ' },
  assignedDate: { en: 'Assigned', bn: 'দেওয়া হয়েছে' },
  status: { en: 'Status', bn: 'অবস্থা' },
  save: { en: 'Save', bn: 'সংরক্ষণ করুন' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  confirm: { en: 'Confirm', bn: 'নিশ্চিত করুন' },
  delete: { en: 'Delete', bn: 'মুছুন' },
  deleteConfirm: { en: 'Are you sure you want to delete?', bn: 'আপনি কি মুছতে চান?' },

  // Status
  active: { en: 'Active', bn: 'সক্রিয়' },
  pending: { en: 'Pending', bn: 'মুলতুবি' },
  overdueStatus: { en: 'Overdue', bn: 'মেয়াদোত্তীর্ণ' },
  completed: { en: 'Completed', bn: 'সম্পন্ন' },
  submitted: { en: 'Submitted', bn: 'জমা দেওয়া' },
  upcoming: { en: 'Upcoming', bn: 'আসন্ন' },
  past: { en: 'Past', bn: 'অতীত' },

  // Exams
  exams: { en: 'Exams', bn: 'পরীক্ষা' },
  manageExams: { en: 'Manage Exams', bn: 'পরীক্ষা ব্যবস্থাপনা' },
  addExam: { en: 'Add Exam', bn: 'পরীক্ষা যোগ করুন' },
  examType: { en: 'Exam Type', bn: 'পরীক্ষার ধরন' },
  date: { en: 'Date', bn: 'তারিখ' },
  marks: { en: 'Marks', bn: 'নম্বর' },
  instructions: { en: 'Instructions', bn: 'নির্দেশনা' },
  classTest: { en: 'Class Test', bn: 'ক্লাস টেস্ট' },
  quiz: { en: 'Quiz', bn: 'কুইজ' },
  midTerm: { en: 'Mid-Term', bn: 'মধ্যবর্তী পরীক্ষা' },
  final: { en: 'Final', bn: 'চূড়ান্ত পরীক্ষা' },

  // Attendance
  manageAttendance: { en: 'Attendance Management', bn: 'উপস্থিতি ব্যবস্থাপনা' },
  onlineAttendance: { en: 'Online Attendance', bn: 'অনলাইন উপস্থিতি' },
  onlineAttendanceActive: { en: 'Active — taking attendance now', bn: 'সক্রিয় — এখন উপস্থিতি নিন' },
  onlineAttendanceInactive: { en: 'Inactive', bn: 'নিষ্ক্রিয়' },
  selectSubject: { en: 'Select Subject', bn: 'বিষয় নির্বাচন করুন' },
  pasteRolls: { en: 'Paste present students roll numbers (one per line)', bn: 'উপস্থিত শিক্ষার্থীদের রোল নম্বর পেস্ট করুন (প্রতি লাইনে একটি)' },
  process: { en: 'Process', bn: 'প্রক্রিয়া করুন' },
  presentNote: { en: 'Rolls entered will be marked Present; others Absent', bn: 'যাদের রোল নম্বর দেবন তারা উপস্থিত, বাকিরা অনুপস্থিত হিসেবে চিহ্নিত হবে' },
  saveAttendance: { en: 'Save Attendance', bn: 'উপস্থিতি সংরক্ষণ করুন' },
  previousSessions: { en: 'Previous Sessions', bn: 'আগের সেশন' },
  present: { en: 'Present', bn: 'উপস্থিত' },
  absent: { en: 'Absent', bn: 'অনুপস্থিত' },
  late: { en: 'Late', bn: 'দেরি' },
  presentShort: { en: '✓', bn: '✓' },
  absentShort: { en: '✗', bn: '✗' },
  lateShort: { en: 'L', bn: 'L' },
  myAttendance: { en: 'My Attendance', bn: 'আমার উপস্থিতি' },

  // Results
  results: { en: 'Results', bn: 'ফলাফল' },
  manageResults: { en: 'Manage Results', bn: 'ফলাফল ব্যবস্থাপনা' },
  addResult: { en: 'Add Result', bn: 'ফলাফল যোগ করুন' },
  marksObtained: { en: 'Marks Obtained', bn: 'প্রাপ্ত নম্বর' },
  totalMarks: { en: 'Total Marks', bn: 'মোট নম্বর' },
  uploadedBy: { en: 'Uploaded by', bn: 'আপলোড করেছেন' },

  // Notices
  manageNotices: { en: 'Manage Notices', bn: 'বিজ্ঞপ্তি ব্যবস্থাপনা' },
  addNotice: { en: 'Add Notice', bn: 'বিজ্ঞপ্তি যোগ করুন' },
  important: { en: 'Important', bn: 'গুরুত্বপূর্ণ' },
  markImportant: { en: 'Mark as Important', bn: 'গুরুত্বপূর্ণ হিসেবে চিহ্নিত করুন' },
  by: { en: 'by', bn: 'দ্বারা' },

  // Routine
  routine: { en: 'Class Routine', bn: 'ক্লাস রুটিন' },
  hall: { en: 'Hall', bn: 'হল' },
  sunday: { en: 'Sunday', bn: 'রবিবার' },
  monday: { en: 'Monday', bn: 'সোমবার' },
  tuesday: { en: 'Tuesday', bn: 'মঙ্গলবার' },
  wednesday: { en: 'Wednesday', bn: 'বুধবার' },
  thursday: { en: 'Thursday', bn: 'বৃহস্পতিবার' },
  friday: { en: 'Friday', bn: 'শুক্রবার' },
  saturday: { en: 'Saturday', bn: 'শনিবার' },
  today: { en: 'Today', bn: 'আজ' },

  // Common
  loading: { en: 'Loading...', bn: 'লোড হচ্ছে...' },
  noData: { en: 'No data found', bn: 'কোনো তথ্য নেই' },
  add: { en: 'Add', bn: 'যোগ করুন' },
  edit: { en: 'Edit', bn: 'সম্পাদনা' },
  activeAssignments: { en: 'Active Assignments', bn: 'সক্রিয় অ্যাসাইনমেন্ট' },
  upcomingExamsCount: { en: 'Upcoming Exams', bn: 'আসন্ন পরীক্ষা' },
  resultsUploaded: { en: 'Results Uploaded', bn: 'ফলাফল আপলোড' },
  pushNotifications: { en: 'Notifications', bn: 'বিজ্ঞপ্তি' },
};

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}
