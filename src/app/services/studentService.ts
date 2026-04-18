import { Student } from '../types';

// Simulates StudentRepository and StudentService from Spring Boot
export class StudentService {
  private static STORAGE_KEY = 'smartsense_students';

  // GET /students/get
  static async getAllStudents(): Promise<Student[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // GET /students/get/{id}
  static async getStudentById(id: number): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const students = await this.getAllStudents();
    return students.find(s => s.id === id) || null;
  }

  // GET /students/class/{className}
  static async getStudentsByClass(className: string): Promise<Student[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const students = await this.getAllStudents();
    return students.filter(s => s.className === className);
  }

  // POST /students/add
  static async addStudent(student: Omit<Student, 'id'>): Promise<Student> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const students = await this.getAllStudents();
    const newStudent: Student = {
      ...student,
      id: Math.max(...students.map(s => s.id), 0) + 1
    };
    students.push(newStudent);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    return newStudent;
  }

  // PUT /students/update/{id}
  static async updateStudent(id: number, updates: Partial<Student>): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const students = await this.getAllStudents();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) return null;

    students[index] = { ...students[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(students));
    return students[index];
  }

  // DELETE /students/delete/{id}
  static async deleteStudent(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const students = await this.getAllStudents();
    const filtered = students.filter(s => s.id !== id);

    if (filtered.length === students.length) return false;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}
