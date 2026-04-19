import { Lecture, LectureAccess, QuizResult } from '../types/lecture';

// Simulates LectureService from Spring Boot
export class LectureService {
  private static LECTURES_KEY = 'smartsense_lectures';
  private static ACCESS_KEY = 'smartsense_lecture_access';
  private static QUIZ_KEY = 'smartsense_quiz_results';

  // Initialize with sample data
  static initializeLectures() {
    if (!localStorage.getItem(this.LECTURES_KEY)) {
      const sampleLectures: Lecture[] = [
        {
          id: 1,
          title: 'Introduction to Data Structures',
          subject: 'Computer Science',
          className: 'Computer Science - Year 3',
          teacherId: 2,
          teacherName: 'Dr. Sarah Johnson',
          recordingUrl: 'https://example.com/lecture1.mp4',
          thumbnailUrl: '',
          duration: 45,
          uploadDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          lectureDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          description: 'Introduction to arrays, linked lists, and basic operations',
          status: 'AVAILABLE'
        },
        {
          id: 2,
          title: 'Binary Search Trees',
          subject: 'Computer Science',
          className: 'Computer Science - Year 3',
          teacherId: 2,
          teacherName: 'Dr. Sarah Johnson',
          recordingUrl: 'https://example.com/lecture2.mp4',
          duration: 50,
          uploadDate: new Date(Date.now() - 86400000).toISOString(),
          lectureDate: new Date(Date.now() - 86400000).toISOString(),
          description: 'BST implementation and traversal algorithms',
          status: 'AVAILABLE'
        },
        {
          id: 3,
          title: 'Graph Algorithms - Part 1',
          subject: 'Computer Science',
          className: 'Computer Science - Year 3',
          teacherId: 2,
          teacherName: 'Dr. Sarah Johnson',
          recordingUrl: '',
          duration: 0,
          uploadDate: new Date().toISOString(),
          lectureDate: new Date().toISOString(),
          description: 'DFS and BFS traversal',
          status: 'RECORDING'
        }
      ];

      localStorage.setItem(this.LECTURES_KEY, JSON.stringify(sampleLectures));
    }

    if (!localStorage.getItem(this.ACCESS_KEY)) {
      const sampleAccess: LectureAccess[] = [
        {
          id: 1,
          lectureId: 1,
          studentId: 1,
          studentName: 'John Doe',
          accessDate: new Date(Date.now() - 3600000).toISOString(),
          watchDuration: 45,
          completed: true
        },
        {
          id: 2,
          lectureId: 1,
          studentId: 2,
          studentName: 'Jane Smith',
          accessDate: new Date(Date.now() - 7200000).toISOString(),
          watchDuration: 30,
          completed: false
        }
      ];

      localStorage.setItem(this.ACCESS_KEY, JSON.stringify(sampleAccess));
    }

    if (!localStorage.getItem(this.QUIZ_KEY)) {
      const sampleQuizzes: QuizResult[] = [
        {
          id: 1,
          studentId: 1,
          quizTitle: 'Arrays and Linked Lists Quiz',
          subject: 'Computer Science',
          score: 18,
          maxScore: 20,
          percentage: 90,
          submittedDate: new Date(Date.now() - 86400000).toISOString(),
          className: 'Computer Science - Year 3'
        },
        {
          id: 2,
          studentId: 1,
          quizTitle: 'BST Operations Quiz',
          subject: 'Computer Science',
          score: 16,
          maxScore: 20,
          percentage: 80,
          submittedDate: new Date().toISOString(),
          className: 'Computer Science - Year 3'
        }
      ];

      localStorage.setItem(this.QUIZ_KEY, JSON.stringify(sampleQuizzes));
    }
  }

  // GET /lectures/all
  static async getAllLectures(): Promise<Lecture[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(this.LECTURES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // GET /lectures/class/{className}
  static async getLecturesByClass(className: string): Promise<Lecture[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lectures = await this.getAllLectures();
    return lectures.filter(l => l.className === className);
  }

  // GET /lectures/teacher/{teacherId}
  static async getLecturesByTeacher(teacherId: number): Promise<Lecture[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lectures = await this.getAllLectures();
    return lectures.filter(l => l.teacherId === teacherId);
  }

  // POST /lectures/start-recording
  static async startRecording(title: string, subject: string, className: string, teacherId: number, teacherName: string): Promise<Lecture> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const lectures = await this.getAllLectures();

    const newLecture: Lecture = {
      id: Math.max(...lectures.map(l => l.id), 0) + 1,
      title,
      subject,
      className,
      teacherId,
      teacherName,
      duration: 0,
      uploadDate: new Date().toISOString(),
      lectureDate: new Date().toISOString(),
      status: 'RECORDING'
    };

    lectures.push(newLecture);
    localStorage.setItem(this.LECTURES_KEY, JSON.stringify(lectures));
    return newLecture;
  }

  // POST /lectures/stop-recording/{id}
  static async stopRecording(id: number, duration: number): Promise<Lecture> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const lectures = await this.getAllLectures();
    const lecture = lectures.find(l => l.id === id);

    if (!lecture) throw new Error('Lecture not found');

    lecture.status = 'PROCESSING';
    lecture.duration = duration;
    lecture.recordingUrl = `https://example.com/lecture${id}.mp4`;

    setTimeout(() => {
      lecture.status = 'AVAILABLE';
      localStorage.setItem(this.LECTURES_KEY, JSON.stringify(lectures));
    }, 3000);

    localStorage.setItem(this.LECTURES_KEY, JSON.stringify(lectures));
    return lecture;
  }

  // POST /lectures/upload
  static async uploadLecture(lecture: Omit<Lecture, 'id'>): Promise<Lecture> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const lectures = await this.getAllLectures();

    const newLecture: Lecture = {
      ...lecture,
      id: Math.max(...lectures.map(l => l.id), 0) + 1,
      uploadDate: new Date().toISOString()
    };

    lectures.push(newLecture);
    localStorage.setItem(this.LECTURES_KEY, JSON.stringify(lectures));
    return newLecture;
  }

  // DELETE /lectures/{id}
  static async deleteLecture(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lectures = await this.getAllLectures();
    const filtered = lectures.filter(l => l.id !== id);

    if (filtered.length === lectures.length) return false;

    localStorage.setItem(this.LECTURES_KEY, JSON.stringify(filtered));
    return true;
  }

  // GET /lectures/{id}/access
  static async getLectureAccess(lectureId: number): Promise<LectureAccess[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(this.ACCESS_KEY);
    const allAccess: LectureAccess[] = stored ? JSON.parse(stored) : [];
    return allAccess.filter(a => a.lectureId === lectureId);
  }

  // POST /lectures/{id}/record-access
  static async recordAccess(lectureId: number, studentId: number, studentName: string): Promise<LectureAccess> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(this.ACCESS_KEY);
    const allAccess: LectureAccess[] = stored ? JSON.parse(stored) : [];

    const newAccess: LectureAccess = {
      id: Math.max(...allAccess.map(a => a.id), 0) + 1,
      lectureId,
      studentId,
      studentName,
      accessDate: new Date().toISOString(),
      watchDuration: 0,
      completed: false
    };

    allAccess.push(newAccess);
    localStorage.setItem(this.ACCESS_KEY, JSON.stringify(allAccess));
    return newAccess;
  }

  // GET /quiz/student/{studentId}
  static async getQuizResultsByStudent(studentId: number): Promise<QuizResult[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(this.QUIZ_KEY);
    const allQuizzes: QuizResult[] = stored ? JSON.parse(stored) : [];
    return allQuizzes.filter(q => q.studentId === studentId);
  }
}
