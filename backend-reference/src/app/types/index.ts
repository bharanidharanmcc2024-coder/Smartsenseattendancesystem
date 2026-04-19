// Model types matching backend entities

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: number;
  username: string;
  password: string;
  role: Role;
  name: string;
  email: string;
}

export interface Student {
  id: number;
  name: string;
  rollNumber: string;
  className: string;
  email: string;
  faceData?: string; // Base64 encoded face template
  phone?: string;
  userId: number;
}

export interface Attendance {
  id: number;
  studentId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  timestamp: string;
  className: string;
  verificationMethod: 'FACE_RECOGNITION' | 'MANUAL';
  confidence?: number; // Face recognition confidence score
}

export interface Engagement {
  id: number;
  studentId: number;
  date: string;
  attentionScore: number; // 0-100
  participationScore: number; // 0-100
  className: string;
  timestamp: string;
}

export interface Alert {
  id: number;
  type: 'LOW_ATTENDANCE' | 'LOW_ENGAGEMENT' | 'PROXY_DETECTED' | 'SYSTEM';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  studentId?: number;
  resolved: boolean;
}

export interface DashboardSummary {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  averageAttendance: number;
  averageEngagement: number;
  alerts: Alert[];
}

export interface AttendanceReport {
  studentId: number;
  studentName: string;
  className: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
}
