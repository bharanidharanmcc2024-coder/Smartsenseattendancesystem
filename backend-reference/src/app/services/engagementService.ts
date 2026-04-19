import { Engagement } from '../types';

// Simulates EngagementRepository and EngagementService from Spring Boot
export class EngagementService {
  private static STORAGE_KEY = 'smartsense_engagement';

  // GET /engagement/all
  static async getAllEngagement(): Promise<Engagement[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // GET /engagement/student/{studentId}
  static async getEngagementByStudent(studentId: number): Promise<Engagement[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const engagement = await this.getAllEngagement();
    return engagement.filter(e => e.studentId === studentId);
  }

  // GET /engagement/student/{studentId}/average
  static async getAverageEngagement(studentId: number): Promise<{ attention: number; participation: number }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const engagement = await this.getEngagementByStudent(studentId);

    if (engagement.length === 0) {
      return { attention: 0, participation: 0 };
    }

    const avgAttention = engagement.reduce((sum, e) => sum + e.attentionScore, 0) / engagement.length;
    const avgParticipation = engagement.reduce((sum, e) => sum + e.participationScore, 0) / engagement.length;

    return {
      attention: Math.round(avgAttention),
      participation: Math.round(avgParticipation)
    };
  }

  // POST /engagement/record
  static async recordEngagement(
    studentId: number,
    attentionScore: number,
    participationScore: number,
    className: string
  ): Promise<Engagement> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const engagement = await this.getAllEngagement();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const newRecord: Engagement = {
      id: Math.max(...engagement.map(e => e.id), 0) + 1,
      studentId,
      date: today,
      attentionScore,
      participationScore,
      className,
      timestamp: now
    };

    engagement.push(newRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(engagement));
    return newRecord;
  }

  // GET /engagement/class/{className}/average
  static async getClassAverageEngagement(className: string): Promise<{ attention: number; participation: number }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const engagement = await this.getAllEngagement();
    const classEngagement = engagement.filter(e => e.className === className);

    if (classEngagement.length === 0) {
      return { attention: 0, participation: 0 };
    }

    const avgAttention = classEngagement.reduce((sum, e) => sum + e.attentionScore, 0) / classEngagement.length;
    const avgParticipation = classEngagement.reduce((sum, e) => sum + e.participationScore, 0) / classEngagement.length;

    return {
      attention: Math.round(avgAttention),
      participation: Math.round(avgParticipation)
    };
  }
}
