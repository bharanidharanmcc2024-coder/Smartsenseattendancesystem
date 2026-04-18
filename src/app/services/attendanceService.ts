import { Attendance, AttendanceReport } from '../types';
import { StudentService } from './studentService';

// Simulates AttendanceRepository and AttendanceService from Spring Boot
export class AttendanceService {
  private static STORAGE_KEY = 'smartsense_attendance';

  // GET /attendance/all
  static async getAllAttendance(): Promise<Attendance[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // GET /attendance/student/{studentId}
  static async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const attendance = await this.getAllAttendance();
    return attendance.filter(a => a.studentId === studentId);
  }

  // GET /attendance/date/{date}
  static async getAttendanceByDate(date: string): Promise<Attendance[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const attendance = await this.getAllAttendance();
    return attendance.filter(a => a.date === date);
  }

  // GET /attendance/class/{className}
  static async getAttendanceByClass(className: string): Promise<Attendance[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const attendance = await this.getAllAttendance();
    return attendance.filter(a => a.className === className);
  }

  // POST /attendance/mark
  static async markAttendance(
    studentId: number,
    status: 'PRESENT' | 'ABSENT' | 'LATE',
    verificationMethod: 'FACE_RECOGNITION' | 'MANUAL',
    confidence?: number
  ): Promise<Attendance> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const student = await StudentService.getStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const attendance = await this.getAllAttendance();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const newRecord: Attendance = {
      id: Math.max(...attendance.map(a => a.id), 0) + 1,
      studentId,
      date: today,
      status,
      timestamp: now,
      className: student.className,
      verificationMethod,
      confidence
    };

    attendance.push(newRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attendance));
    return newRecord;
  }

  // GET /attendance/report
  static async generateReport(startDate?: string, endDate?: string): Promise<AttendanceReport[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const attendance = await this.getAllAttendance();
    const students = await StudentService.getAllStudents();

    const reports: AttendanceReport[] = [];

    for (const student of students) {
      let studentAttendance = attendance.filter(a => a.studentId === student.id);

      if (startDate) {
        studentAttendance = studentAttendance.filter(a => a.date >= startDate);
      }
      if (endDate) {
        studentAttendance = studentAttendance.filter(a => a.date <= endDate);
      }

      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter(a => a.status === 'PRESENT').length;
      const absentDays = studentAttendance.filter(a => a.status === 'ABSENT').length;
      const lateDays = studentAttendance.filter(a => a.status === 'LATE').length;

      reports.push({
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        percentage: totalDays > 0 ? (presentDays / totalDays) * 100 : 0
      });
    }

    return reports;
  }

  // GET /attendance/today
  static async getTodayAttendance(): Promise<Attendance[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAttendanceByDate(today);
  }
}
