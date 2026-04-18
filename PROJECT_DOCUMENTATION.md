# SmartSense: AI-IoT Classroom Attendance & Engagement System

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Setup Instructions](#setup-instructions)
6. [User Guide](#user-guide)
7. [Academic Demo Guide](#academic-demo-guide)
8. [API Documentation](#api-documentation)
9. [MVC Implementation](#mvc-implementation)

---

## 🎯 Project Overview

SmartSense is an AI-powered classroom attendance and engagement tracking system that uses facial recognition technology to automate attendance marking and prevent proxy attendance. The system also monitors student engagement through attention and participation metrics.

### Key Objectives
- **Automated Attendance**: Face recognition-based attendance marking
- **Anti-Proxy System**: Liveness detection to prevent proxy attendance
- **Engagement Tracking**: Monitor student attention and participation
- **Role-Based Access**: Separate dashboards for Admin, Teacher, and Student
- **Analytics & Reporting**: Comprehensive attendance and engagement reports

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │  Login   │  Admin   │ Teacher  │ Student  │         │
│  │   Page   │Dashboard │Dashboard │Dashboard │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                        │                                 │
│                        │ HTTP/REST API                   │
│                        ▼                                 │
│              ┌──────────────────┐                       │
│              │   Auth Context   │                       │
│              └──────────────────┘                       │
└─────────────────────────┬───────────────────────────────┘
                          │
                          │ REST API Calls
                          ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Spring Boot)                       │
│  ┌──────────────────────────────────────────────┐      │
│  │             CONTROLLER LAYER                  │      │
│  │  [Auth] [Student] [Attendance] [Engagement]  │      │
│  └──────────────────────────────────────────────┘      │
│                        │                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │              SERVICE LAYER                    │      │
│  │  [StudentService] [AttendanceService]         │      │
│  │  [FaceRecognitionService] [DashboardService]  │      │
│  └──────────────────────────────────────────────┘      │
│                        │                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │            REPOSITORY LAYER                   │      │
│  │  [JPA Repositories - Data Access]             │      │
│  └──────────────────────────────────────────────┘      │
│                        │                                 │
└────────────────────────┼─────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   DATABASE (MySQL)     │
            │  [users] [students]    │
            │  [attendance]          │
            │  [engagement] [alerts] │
            └────────────────────────┘
```

### MVC Pattern Implementation

#### MODEL (Entity Layer)
- **User.java**: User authentication and roles
- **Student.java**: Student information and face data
- **Attendance.java**: Attendance records
- **Engagement.java**: Engagement metrics
- **Alert.java**: System notifications

#### VIEW (Frontend)
- **React Components**: UI representation
- **Dashboard Components**: Role-specific views
- **Charts & Analytics**: Data visualization

#### CONTROLLER (API Layer)
- **REST Controllers**: Handle HTTP requests
- **Route Mapping**: Map URLs to business logic
- **Request/Response**: JSON data exchange

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 18.3 with TypeScript
- **Routing**: React Router DOM v7
- **UI Library**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **State Management**: React Context API
- **Build Tool**: Vite

### Backend (Reference Implementation)
- **Framework**: Spring Boot 3.2
- **Language**: Java 17
- **ORM**: Spring Data JPA
- **Security**: Spring Security with JWT
- **Database**: MySQL/PostgreSQL
- **AI Integration**: OpenCV (for face recognition)

### Database
- **Primary**: MySQL 8.0 or PostgreSQL 15
- **Tables**: users, students, attendance, engagement, alerts

---

## ✨ Features

### 1. Face Recognition Attendance System
- **AI-Powered Recognition**: Automatic face detection and matching
- **High Accuracy**: 85-99% confidence scores
- **Real-Time Processing**: Instant attendance marking
- **Liveness Detection**: Anti-spoofing technology

### 2. Anti-Proxy Attendance
- **Liveness Verification**: Detect if person is physically present
- **Confidence Scoring**: Track recognition accuracy
- **Alert System**: Flag low-confidence entries
- **Audit Trail**: Complete attendance history

### 3. Engagement Tracking
- **Attention Score**: Monitor student focus (0-100)
- **Participation Score**: Track class involvement (0-100)
- **Trend Analysis**: Historical engagement data
- **Class Averages**: Compare individual vs. class performance

### 4. Role-Based Dashboards

#### Admin Dashboard
- Student management (Add/Edit/Delete)
- System-wide analytics
- Attendance reports
- Alert management
- User administration

#### Teacher Dashboard
- Face recognition attendance marking
- Class attendance view
- Engagement monitoring
- Alert notifications
- Today's attendance summary

#### Student Dashboard
- Personal attendance history
- Engagement scores
- Attendance percentage
- Recent records
- Status alerts

### 5. Analytics & Reporting
- **Attendance Reports**: Individual and class-level
- **Engagement Analytics**: Attention and participation trends
- **Visual Charts**: Bar charts, line graphs, pie charts
- **Export Capability**: Generate CSV/PDF reports

---

## 🚀 Setup Instructions

### Frontend Setup

1. **Navigate to project directory**
   ```bash
   cd /workspaces/default/code
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the application**
   The dev server should already be running. If not, contact your environment administrator.

4. **Access the application**
   Open the preview surface provided by your environment.

5. **Demo Credentials**
   - **Admin**: username: `admin`, password: `admin123`
   - **Teacher**: username: `teacher`, password: `teacher123`
   - **Student**: username: `john.doe`, password: `student123`

### Backend Setup (Production)

1. **Prerequisites**
   - Java 17 or higher
   - Maven 3.6+
   - MySQL 8.0 or PostgreSQL 15

2. **Database Setup**
   ```bash
   mysql -u root -p
   CREATE DATABASE smartsense_db;
   USE smartsense_db;
   SOURCE backend-reference/database-schema.sql;
   ```

3. **Configure Application**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smartsense_db
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

4. **Build and Run**
   ```bash
   cd backend-reference
   mvn clean install
   mvn spring-boot:run
   ```

5. **API Access**
   Backend will be available at `http://localhost:8080`

---

## 📖 User Guide

### For Admins

1. **Login** with admin credentials
2. **Dashboard Overview**:
   - View total students, present/absent counts
   - Monitor average attendance and engagement
   - Check active alerts

3. **Student Management**:
   - Click "Student Management" tab
   - Add new students using the "Add Student" button
   - Edit or delete existing students

4. **View Reports**:
   - Navigate to "Reports" tab
   - View detailed attendance statistics
   - Export reports for record-keeping

### For Teachers

1. **Login** with teacher credentials
2. **Mark Attendance**:
   - Go to "Mark Attendance" tab
   - Click "Start Face Scan"
   - Position student in front of camera
   - System automatically recognizes and marks attendance
   - View recognition confidence and liveness scores

3. **View Attendance**:
   - Switch to "View Records" tab
   - Select date to view attendance
   - See all students with their status

4. **Monitor Engagement**:
   - Go to "Engagement" tab
   - View attention and participation scores
   - Identify students needing support

### For Students

1. **Login** with student credentials
2. **View Dashboard**:
   - Check attendance percentage
   - View attention and participation scores
   - See overall status

3. **Recent Records**:
   - Scroll down to see recent attendance
   - Check if attendance was marked via AI or manually
   - View face recognition confidence scores

4. **Alerts**:
   - Top of dashboard shows any alerts
   - Take action if attendance is below 75%

---

## 🎓 Academic Demo Guide

### For Viva/Presentation

#### 1. Introduction (2 minutes)
- Explain the problem: Manual attendance is time-consuming
- Introduce SmartSense as the solution
- Highlight AI integration and anti-proxy features

#### 2. Architecture Walkthrough (3 minutes)
- Show MVC architecture diagram
- Explain separation of concerns
- Discuss technology choices

#### 3. Live Demo (5-7 minutes)

**Admin Demo**:
1. Login as admin
2. Show dashboard with analytics
3. Add a new student
4. View attendance reports

**Teacher Demo**:
1. Login as teacher
2. Demonstrate face recognition attendance
3. Explain confidence scores and liveness detection
4. Show engagement tracking

**Student Demo**:
1. Login as student
2. Show personal dashboard
3. Explain attendance tracking
4. View engagement scores

#### 4. Code Walkthrough (3 minutes)
- Show Model classes (Entity structure)
- Explain Service layer (Business logic)
- Demonstrate Controller (REST APIs)
- Highlight Repository pattern

#### 5. Database Schema (2 minutes)
- Show ER diagram
- Explain relationships
- Demonstrate sample queries

#### 6. Face Recognition (2 minutes)
- Explain how face recognition works
- Discuss liveness detection
- Show confidence scoring system

#### 7. Q&A Preparation

**Common Questions**:

Q: How does face recognition work?
A: We extract facial features as embeddings, store them, and match against captured images using similarity algorithms.

Q: How do you prevent proxy attendance?
A: Liveness detection checks if a real person is present (not a photo/video) using blink detection and texture analysis.

Q: What happens if recognition fails?
A: Teachers can mark attendance manually. System also flags low-confidence entries for review.

Q: How scalable is this system?
A: With proper infrastructure, it can handle 1000+ students. Cloud deployment ensures scalability.

Q: What about privacy concerns?
A: Face data is encrypted, stored securely, and used only for attendance. Students/parents provide consent.

---

## 📡 API Documentation

### Authentication Endpoints

#### POST /auth/login
Login user
```json
Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN",
    "name": "Admin User"
  }
}
```

### Student Endpoints

#### GET /students/get
Get all students
```
Response: Array of Student objects
```

#### POST /students/add
Add new student
```json
Request:
{
  "name": "Alex Kumar",
  "rollNumber": "CS2024009",
  "className": "Computer Science - Year 3",
  "email": "alex@student.edu",
  "phone": "+1-555-0109"
}
```

### Attendance Endpoints

#### POST /attendance/mark
Mark attendance
```json
Request:
{
  "studentId": 1,
  "status": "PRESENT",
  "verificationMethod": "FACE_RECOGNITION",
  "confidence": 0.95
}
```

#### GET /attendance/report?startDate=2026-01-01&endDate=2026-04-18
Generate attendance report

---

## 🏛️ MVC Implementation

### Model Layer
```java
@Entity
public class Student {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String rollNumber;
    // ... other fields
}
```

### Repository Layer
```java
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByClassName(String className);
}
```

### Service Layer
```java
@Service
public class StudentService {
    @Autowired
    private StudentRepository repository;

    public List<Student> getAllStudents() {
        return repository.findAll();
    }
}
```

### Controller Layer
```java
@RestController
@RequestMapping("/students")
public class StudentController {
    @Autowired
    private StudentService service;

    @GetMapping("/get")
    public ResponseEntity<List<Student>> getAll() {
        return ResponseEntity.ok(service.getAllStudents());
    }
}
```

### View Layer (React)
```tsx
// AdminDashboard.tsx
export default function AdminDashboard() {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        StudentService.getAllStudents()
            .then(data => setStudents(data));
    }, []);

    return <div>/* Dashboard UI */</div>;
}
```

---

## 📊 Database Schema

See `backend-reference/database-schema.sql` for complete schema with:
- Table definitions
- Indexes for performance
- Foreign key relationships
- Sample data
- Useful queries

---

## 🔒 Security Features

1. **Authentication**: JWT-based token authentication
2. **Authorization**: Role-based access control (RBAC)
3. **Password Encryption**: BCrypt hashing
4. **Input Validation**: Server-side validation
5. **SQL Injection Prevention**: Prepared statements
6. **CORS Configuration**: Controlled cross-origin access

---

## 🚧 Future Enhancements

1. **Multi-Camera Support**: Multiple rooms/classes
2. **Mobile App**: React Native app for students
3. **Email Notifications**: Automated absence alerts
4. **Biometric Backup**: Fingerprint as secondary method
5. **AI Improvements**: Better accuracy with deep learning
6. **Cloud Deployment**: AWS/Azure hosting
7. **Real-Time Updates**: WebSocket integration
8. **Parent Portal**: View child's attendance

---

## 📝 License

This project is created for educational purposes as part of academic coursework.

---

## 👥 Credits

Developed as a demonstration of full-stack development with AI integration using Spring Boot and React.

---

## 📞 Support

For questions or issues:
1. Review this documentation
2. Check the code comments
3. Consult your instructor/supervisor
