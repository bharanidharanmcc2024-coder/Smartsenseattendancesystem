import { User, Student, Attendance, Engagement, Alert } from '../types';

// Mock Users (credentials for demo)
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Admin User',
    email: 'admin@smartsense.edu'
  },
  {
    id: 2,
    username: 'teacher',
    password: 'teacher123',
    role: 'TEACHER',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@smartsense.edu'
  },
  {
    id: 3,
    username: 'john.doe',
    password: 'student123',
    role: 'STUDENT',
    name: 'John Doe',
    email: 'john.doe@student.edu'
  },
  {
    id: 4,
    username: 'jane.smith',
    password: 'student123',
    role: 'STUDENT',
    name: 'Jane Smith',
    email: 'jane.smith@student.edu'
  },
  {
    id: 5,
    username: 'mike.wilson',
    password: 'student123',
    role: 'STUDENT',
    name: 'Mike Wilson',
    email: 'mike.wilson@student.edu'
  }
];

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 1,
    name: 'John Doe',
    rollNumber: 'CS2024001',
    className: 'Computer Science - Year 3',
    email: 'john.doe@student.edu',
    phone: '+1-555-0101',
    faceData: 'MOCK_FACE_TEMPLATE_001',
    userId: 3
  },
  {
    id: 2,
    name: 'Jane Smith',
    rollNumber: 'CS2024002',
    className: 'Computer Science - Year 3',
    email: 'jane.smith@student.edu',
    phone: '+1-555-0102',
    faceData: 'MOCK_FACE_TEMPLATE_002',
    userId: 4
  },
  {
    id: 3,
    name: 'Mike Wilson',
    rollNumber: 'CS2024003',
    className: 'Computer Science - Year 3',
    email: 'mike.wilson@student.edu',
    phone: '+1-555-0103',
    faceData: 'MOCK_FACE_TEMPLATE_003',
    userId: 5
  },
  {
    id: 4,
    name: 'Emily Brown',
    rollNumber: 'CS2024004',
    className: 'Computer Science - Year 3',
    email: 'emily.brown@student.edu',
    phone: '+1-555-0104',
    faceData: 'MOCK_FACE_TEMPLATE_004',
    userId: 6
  },
  {
    id: 5,
    name: 'David Lee',
    rollNumber: 'CS2024005',
    className: 'Computer Science - Year 3',
    email: 'david.lee@student.edu',
    phone: '+1-555-0105',
    faceData: 'MOCK_FACE_TEMPLATE_005',
    userId: 7
  },
  {
    id: 6,
    name: 'Sarah Martinez',
    rollNumber: 'CS2024006',
    className: 'Computer Science - Year 2',
    email: 'sarah.martinez@student.edu',
    phone: '+1-555-0106',
    faceData: 'MOCK_FACE_TEMPLATE_006',
    userId: 8
  },
  {
    id: 7,
    name: 'Alex Kumar',
    rollNumber: 'CS2024007',
    className: 'Computer Science - Year 2',
    email: 'alex.kumar@student.edu',
    phone: '+1-555-0107',
    faceData: 'MOCK_FACE_TEMPLATE_007',
    userId: 9
  },
  {
    id: 8,
    name: 'Lisa Chen',
    rollNumber: 'CS2024008',
    className: 'Computer Science - Year 2',
    email: 'lisa.chen@student.edu',
    phone: '+1-555-0108',
    faceData: 'MOCK_FACE_TEMPLATE_008',
    userId: 10
  }
];

// Generate mock attendance data for the last 30 days
export const generateMockAttendance = (): Attendance[] => {
  const attendance: Attendance[] = [];
  let id = 1;
  const today = new Date();

  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];

    mockStudents.forEach((student) => {
      // 85% chance of being present, 10% late, 5% absent
      const rand = Math.random();
      let status: 'PRESENT' | 'ABSENT' | 'LATE';

      if (rand < 0.85) status = 'PRESENT';
      else if (rand < 0.95) status = 'LATE';
      else status = 'ABSENT';

      attendance.push({
        id: id++,
        studentId: student.id,
        date: dateStr,
        status,
        timestamp: `${dateStr}T${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
        className: student.className,
        verificationMethod: status === 'ABSENT' ? 'MANUAL' : 'FACE_RECOGNITION',
        confidence: status === 'ABSENT' ? undefined : 0.85 + Math.random() * 0.14
      });
    });
  }

  return attendance;
};

// Generate mock engagement data
export const generateMockEngagement = (): Engagement[] => {
  const engagement: Engagement[] = [];
  let id = 1;
  const today = new Date();

  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];

    mockStudents.forEach((student) => {
      engagement.push({
        id: id++,
        studentId: student.id,
        date: dateStr,
        attentionScore: 60 + Math.floor(Math.random() * 35),
        participationScore: 55 + Math.floor(Math.random() * 40),
        className: student.className,
        timestamp: `${dateStr}T${8 + Math.floor(Math.random() * 4)}:00:00`
      });
    });
  }

  return engagement;
};

// Generate mock alerts
export const generateMockAlerts = (): Alert[] => {
  return [
    {
      id: 1,
      type: 'LOW_ATTENDANCE',
      message: 'Student Mike Wilson has attendance below 75%',
      severity: 'WARNING',
      timestamp: new Date().toISOString(),
      studentId: 3,
      resolved: false
    },
    {
      id: 2,
      type: 'LOW_ENGAGEMENT',
      message: 'Class CS-Year2 showing low engagement scores (avg: 65%)',
      severity: 'INFO',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      resolved: false
    },
    {
      id: 3,
      type: 'PROXY_DETECTED',
      message: 'Possible proxy attendance detected for David Lee - low confidence score',
      severity: 'CRITICAL',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      studentId: 5,
      resolved: false
    },
    {
      id: 4,
      type: 'SYSTEM',
      message: 'Face recognition system updated successfully',
      severity: 'INFO',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      resolved: true
    }
  ];
};

// Initialize mock data
export const initializeMockData = () => {
  if (!localStorage.getItem('smartsense_students')) {
    localStorage.setItem('smartsense_students', JSON.stringify(mockStudents));
  }

  if (!localStorage.getItem('smartsense_attendance')) {
    localStorage.setItem('smartsense_attendance', JSON.stringify(generateMockAttendance()));
  }

  if (!localStorage.getItem('smartsense_engagement')) {
    localStorage.setItem('smartsense_engagement', JSON.stringify(generateMockEngagement()));
  }

  if (!localStorage.getItem('smartsense_alerts')) {
    localStorage.setItem('smartsense_alerts', JSON.stringify(generateMockAlerts()));
  }
};
