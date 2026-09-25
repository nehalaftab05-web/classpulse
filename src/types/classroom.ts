export type UrgencyLevel = 'critical' | 'soon' | 'upcoming' | 'normal';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type CourseType = 'lecture' | 'lab' | 'tutorial' | 'quiz' | 'exam';

export interface Course {
  id: string;
  name: string;
  section: string;
  code: string;
  room?: string;
  instructor: string;
  color: string; // Tailwind color or hex
  description?: string;
  meetLink?: string;
  alternateLink?: string;
}

export interface TimetableSlot {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1 = Monday, 7 = Sunday
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  room: string;
  type: CourseType;
  instructor: string;
  color: string;
  meetLink?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  title: string;
  description: string;
  dueDate: string; // ISO string e.g. "2026-09-14T23:59:00Z"
  maxPoints?: number;
  status: TaskStatus;
  type: 'assignment' | 'quiz' | 'lab_report' | 'project';
  submissionUrl?: string;
  isUrgent?: boolean;
  estimatedHours?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  institution?: string;
  isDemoMode: boolean;
}
