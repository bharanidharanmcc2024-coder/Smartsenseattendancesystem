// Lecture-related types

export interface Lecture {
  id: number;
  title: string;
  subject: string;
  className: string;
  teacherId: number;
  teacherName: string;
  recordingUrl?: string;
  thumbnailUrl?: string;
  duration: number; // in minutes
  uploadDate: string;
  lectureDate: string;
  description?: string;
  status: 'RECORDING' | 'PROCESSING' | 'AVAILABLE' | 'ARCHIVED';
}

export interface LectureAccess {
  id: number;
  lectureId: number;
  studentId: number;
  studentName: string;
  accessDate: string;
  watchDuration: number; // in minutes
  completed: boolean;
}

export interface QuizResult {
  id: number;
  studentId: number;
  quizTitle: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedDate: string;
  className: string;
}
