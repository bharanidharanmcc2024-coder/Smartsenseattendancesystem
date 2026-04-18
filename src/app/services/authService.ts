import { User } from '../types';
import { mockUsers } from './mockData';

// Simulates Spring Security authentication
export class AuthService {
  private static STORAGE_KEY = 'smartsense_current_user';

  // POST /auth/login
  static async login(username: string, password: string): Promise<User | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      const userWithoutPassword = { ...user, password: '' };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    }

    return null;
  }

  // POST /auth/logout
  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // GET /auth/current-user
  static getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}
