import { DashboardSummary, Alert } from '../types';
import { AttendanceService } from './attendanceService';
import { EngagementService } from './engagementService';
import { StudentService } from './studentService';

// Simulates DashboardService from Spring Boot
export class DashboardService {
  private static ALERTS_KEY = 'smartsense_alerts';

  // GET /dashboard/summary
  static async getDashboardSummary(): Promise<DashboardSummary> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const students = await StudentService.getAllStudents();
    const todayAttendance = await AttendanceService.getTodayAttendance();
    const allAttendance = await AttendanceService.getAllAttendance();
    const allEngagement = await EngagementService.getAllEngagement();

    const totalStudents = students.length;
    const presentToday = todayAttendance.filter(a => a.status === 'PRESENT').length;
    const absentToday = totalStudents - presentToday;

    // Calculate average attendance
    const totalDays = new Set(allAttendance.map(a => a.date)).size;
    const totalPresent = allAttendance.filter(a => a.status === 'PRESENT').length;
    const averageAttendance = totalDays > 0 ? (totalPresent / (totalStudents * totalDays)) * 100 : 0;

    // Calculate average engagement
    const avgEngagement = allEngagement.length > 0
      ? (allEngagement.reduce((sum, e) => sum + (e.attentionScore + e.participationScore) / 2, 0) / allEngagement.length)
      : 0;

    const alerts = await this.getAlerts();

    return {
      totalStudents,
      presentToday,
      absentToday,
      averageAttendance: Math.round(averageAttendance),
      averageEngagement: Math.round(avgEngagement),
      alerts: alerts.filter(a => !a.resolved).slice(0, 5)
    };
  }

  // GET /dashboard/alerts
  static async getAlerts(): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const stored = localStorage.getItem(this.ALERTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // POST /dashboard/alert
  static async createAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const alerts = await this.getAlerts();
    const newAlert: Alert = {
      ...alert,
      id: Math.max(...alerts.map(a => a.id), 0) + 1
    };

    alerts.unshift(newAlert);
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
    return newAlert;
  }

  // PUT /dashboard/alert/{id}/resolve
  static async resolveAlert(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const alerts = await this.getAlerts();
    const alert = alerts.find(a => a.id === id);

    if (!alert) return false;

    alert.resolved = true;
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
    return true;
  }

  // DELETE /dashboard/alert/{id}
  static async deleteAlert(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const alerts = await this.getAlerts();
    const filtered = alerts.filter(a => a.id !== id);

    if (filtered.length === alerts.length) return false;

    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(filtered));
    return true;
  }
}
