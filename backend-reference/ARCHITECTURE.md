# SmartSense System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │  Admin   │    │ Teacher  │    │ Student  │                  │
│  │  User    │    │   User   │    │   User   │                  │
│  └──────────┘    └──────────┘    └──────────┘                  │
│       │                │                │                         │
│       └────────────────┴────────────────┘                        │
│                        │                                          │
│                   Browser / HTTP                                 │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (React)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Login Component                       │  │
│  │  - Authentication Form                                    │  │
│  │  - Credential Validation                                  │  │
│  │  - Role-based Redirect                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                        │
│  ┌──────────────────────┼────────────────────────────────────┐ │
│  │                      │                                     │ │
│  │  ┌──────────────┐   │   ┌──────────────┐ ┌─────────────┐│ │
│  │  │    Admin     │   │   │   Teacher    │ │   Student   ││ │
│  │  │  Dashboard   │   │   │  Dashboard   │ │  Dashboard  ││ │
│  │  │──────────────│   │   │──────────────│ │─────────────││ │
│  │  │• Analytics   │   │   │• Face Recog  │ │• Attendance ││ │
│  │  │• Student Mgmt│   │   │• Attendance  │ │  History    ││ │
│  │  │• Reports     │   │   │• Engagement  │ │• Scores     ││ │
│  │  │• Alerts      │   │   │• Alerts      │ │• Alerts     ││ │
│  │  └──────────────┘   │   └──────────────┘ └─────────────┘│ │
│  │                      │                                     │ │
│  └──────────────────────┼────────────────────────────────────┘ │
│                         │                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Service Layer (Mock/Real)                   │  │
│  │  [Auth] [Student] [Attendance] [Engagement] [Face Recog] │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                    REST API / HTTP
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER (Spring Boot)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   CONTROLLER LAYER                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │   Auth   │ │ Student  │ │Attendance│ │Dashboard │   │  │
│  │  │Controller│ │Controller│ │Controller│ │Controller│   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  │       │             │             │            │          │  │
│  │       └─────────────┴─────────────┴────────────┘          │  │
│  │                          │                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              SERVICE LAYER                          │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐               │  │  │
│  │  │  │   Student    │  │  Attendance  │               │  │  │
│  │  │  │   Service    │  │   Service    │               │  │  │
│  │  │  └──────────────┘  └──────────────┘               │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐               │  │  │
│  │  │  │ Engagement   │  │     Face     │               │  │  │
│  │  │  │   Service    │  │ Recognition  │               │  │  │
│  │  │  └──────────────┘  └──────────────┘               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          │                                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │            REPOSITORY LAYER (JPA)                   │  │  │
│  │  │  [UserRepo] [StudentRepo] [AttendanceRepo] [...]   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                    JPA / JDBC
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (MySQL)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │users │  │students │  │attendance│  │engagement│     │  │
│  │  └──────┘  └─────────┘  └──────────┘  └──────────┘     │  │
│  │       │          │             │             │           │  │
│  │       └──────────┼─────────────┼─────────────┘           │  │
│  │                  │             │                          │  │
│  │            ┌─────────┐                                    │  │
│  │            │ alerts  │                                    │  │
│  │            └─────────┘                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow: Attendance Marking

```
Teacher Dashboard
       │
       ▼
[Start Face Scan] ──────┐
       │                 │
       ▼                 │ 1. Request
Face Recognition      ◄──┘
   Component
       │
       ▼
   Capture Face ────────┐
       │                 │
       ▼                 │ 2. Image Data
Face Recognition      ◄──┘
   Service
       │
       ├───► Extract Features (128/512-D vector)
       │
       ├───► Liveness Detection (Anti-spoofing)
       │
       ├───► Match with Database
       │              │
       │              ▼
       │        Student Repository
       │              │
       │              ▼
       │         students Table
       │         (face_data)
       │
       ▼
Calculate Confidence
       │
       ├─── If confidence < 85% ───► Alert Service
       │
       ▼
Attendance Service
       │
       ├───► Create Attendance Record
       │              │
       │              ▼
       │      Attendance Repository
       │              │
       │              ▼
       │       attendance Table
       │
       ▼
Return Result to Frontend
       │
       ▼
Display: Student Name, Confidence, Status
```

## 🔐 Authentication Flow

```
User (Browser)
       │
       │ 1. POST /auth/login
       │    { username, password }
       ▼
Auth Controller
       │
       ▼
Auth Service
       │
       ├───► Validate Credentials
       │              │
       │              ▼
       │        User Repository
       │              │
       │              ▼
       │         users Table
       │
       ├───► BCrypt.compare(password, hash)
       │
       ├───► Generate JWT Token
       │         │
       │         ├─── Header: { alg: "HS256" }
       │         ├─── Payload: { userId, role }
       │         └─── Signature: sign(secret)
       │
       ▼
Return { token, user }
       │
       ▼
Frontend stores JWT
       │
       ├───► localStorage
       ├───► AuthContext
       │
       ▼
Redirect to Dashboard based on role
       │
       ├─── ADMIN ────► Admin Dashboard
       ├─── TEACHER ──► Teacher Dashboard
       └─── STUDENT ──► Student Dashboard
```

## 📊 Database Entity Relationships

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │─┐
│ username    │ │
│ password    │ │
│ role        │ │
│ name        │ │
│ email       │ │
└─────────────┘ │
                │ One-to-Many
                │
                │
┌───────────────▼─────┐
│    students         │
│─────────────────────│
│ id (PK)             │─────┐
│ name                │     │
│ roll_number         │     │
│ class_name          │     │
│ email               │     │
│ phone               │     │
│ face_data           │     │ One-to-Many
│ user_id (FK)        │     │
└─────────────────────┘     │
                            │
        ┌───────────────────┴─────────────┬─────────────────┐
        │                                 │                  │
        ▼                                 ▼                  ▼
┌─────────────────┐          ┌─────────────────┐  ┌─────────────────┐
│   attendance    │          │   engagement    │  │     alerts      │
│─────────────────│          │─────────────────│  │─────────────────│
│ id (PK)         │          │ id (PK)         │  │ id (PK)         │
│ student_id (FK) │          │ student_id (FK) │  │ type            │
│ date            │          │ date            │  │ message         │
│ status          │          │ attention_score │  │ severity        │
│ timestamp       │          │ participation   │  │ timestamp       │
│ class_name      │          │ class_name      │  │ student_id (FK) │
│ method          │          │ timestamp       │  │ resolved        │
│ confidence      │          │                 │  │                 │
└─────────────────┘          └─────────────────┘  └─────────────────┘
```

## 🎨 Component Hierarchy (React)

```
App (BrowserRouter)
 │
 ├── AuthProvider (Context)
 │    │
 │    └── AuthContext
 │         ├── user
 │         ├── login()
 │         └── logout()
 │
 ├── Routes
 │    │
 │    ├── /login
 │    │    └── Login Component
 │    │
 │    ├── / (Protected)
 │    │    └── DashboardRouter
 │    │         ├── if ADMIN → AdminDashboard
 │    │         ├── if TEACHER → TeacherDashboard
 │    │         └── if STUDENT → StudentDashboard
 │    │
 │    ├── /admin (Protected, ADMIN only)
 │    │    └── AdminDashboard
 │    │         ├── Layout
 │    │         │    ├── Header
 │    │         │    └── Main Content
 │    │         ├── Stats Cards
 │    │         ├── Alerts
 │    │         └── Tabs
 │    │              ├── Overview
 │    │              │    ├── Attendance Chart
 │    │              │    └── Status Pie Chart
 │    │              ├── Student Management
 │    │              │    ├── Student Table
 │    │              │    └── Add/Edit/Delete
 │    │              └── Reports
 │    │                   └── Attendance Report Table
 │    │
 │    ├── /teacher (Protected, TEACHER only)
 │    │    └── TeacherDashboard
 │    │         ├── Layout
 │    │         ├── Stats Cards
 │    │         ├── Alerts
 │    │         └── Tabs
 │    │              ├── Mark Attendance
 │    │              │    └── FaceRecognitionAttendance
 │    │              │         ├── Camera View
 │    │              │         └── Results Display
 │    │              ├── View Records
 │    │              │    └── ClassAttendanceView
 │    │              │         └── Attendance Table
 │    │              └── Engagement
 │    │                   └── EngagementMonitor
 │    │                        ├── Charts
 │    │                        └── Student Table
 │    │
 │    └── /student (Protected, STUDENT only)
 │         └── StudentDashboard
 │              ├── Layout
 │              ├── Student Info Card
 │              ├── Stats Cards
 │              ├── Alerts
 │              ├── Charts
 │              │    ├── Attendance Trend
 │              │    └── Confidence Chart
 │              └── Recent Records Table
 │
 └── Shared Components
      ├── ui/ (shadcn/ui)
      │    ├── button
      │    ├── card
      │    ├── table
      │    ├── chart
      │    └── ...
      └── Layout
           ├── Header
           └── Content Area
```

## 🔧 Service Architecture (Frontend)

```
Services (TypeScript)
 │
 ├── authService.ts
 │    ├── login(username, password)
 │    ├── logout()
 │    ├── getCurrentUser()
 │    └── hasRole(role)
 │
 ├── studentService.ts
 │    ├── getAllStudents()
 │    ├── getStudentById(id)
 │    ├── addStudent(student)
 │    ├── updateStudent(id, data)
 │    └── deleteStudent(id)
 │
 ├── attendanceService.ts
 │    ├── getAllAttendance()
 │    ├── getAttendanceByStudent(id)
 │    ├── markAttendance(...)
 │    ├── generateReport()
 │    └── getTodayAttendance()
 │
 ├── engagementService.ts
 │    ├── getAllEngagement()
 │    ├── getEngagementByStudent(id)
 │    ├── recordEngagement(...)
 │    └── getAverageEngagement(id)
 │
 ├── faceRecognitionService.ts
 │    ├── captureFace()
 │    ├── recognizeFace(data)
 │    ├── detectLiveness(data)
 │    └── enrollFace(studentId, data)
 │
 └── dashboardService.ts
      ├── getDashboardSummary()
      ├── getAlerts()
      ├── createAlert(alert)
      └── resolveAlert(id)
```

## 🗄️ State Management

```
Application State
 │
 ├── Authentication State (Context)
 │    ├── user: User | null
 │    ├── isAuthenticated: boolean
 │    ├── login()
 │    └── logout()
 │
 ├── Local State (Component useState)
 │    ├── Dashboard Data
 │    │    ├── summary
 │    │    ├── students
 │    │    ├── attendance
 │    │    └── engagement
 │    │
 │    ├── UI State
 │    │    ├── loading
 │    │    ├── errors
 │    │    ├── dialogs
 │    │    └── tabs
 │    │
 │    └── Form State
 │         ├── input values
 │         ├── validation
 │         └── submission
 │
 └── Persistent State (localStorage)
      ├── smartsense_current_user
      ├── smartsense_students
      ├── smartsense_attendance
      ├── smartsense_engagement
      └── smartsense_alerts
```

## 🔄 Request/Response Flow

### Example: Adding a Student

```
User Action: Click "Add Student" in Admin Dashboard
       │
       ▼
Form Component
       │ Collect Input
       │ ┌─────────────┐
       │ │ name        │
       │ │ roll_number │
       │ │ class_name  │
       │ │ email       │
       │ │ phone       │
       │ └─────────────┘
       │
       ▼
Validate Input (Frontend)
       │
       ▼
StudentService.addStudent(data)
       │
       │ Mock: localStorage
       │ Real: POST /students/add
       │
       ▼
Backend: StudentController
       │
       ▼
StudentService.addStudent()
       │
       ├───► Validate unique roll_number
       ├───► Validate unique email
       │
       ▼
StudentRepository.save()
       │
       ▼
Database: INSERT INTO students
       │
       ▼
Return: Student object with id
       │
       ▼
Frontend: Update UI
       │
       ├───► Add to local state
       ├───► Close dialog
       └───► Show success message
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vercel/Netlify)                              │
│  ┌────────────────────────────┐                         │
│  │  React Build (Static)      │                         │
│  │  CDN Distributed           │                         │
│  │  HTTPS Enabled             │                         │
│  └────────────────────────────┘                         │
│                │                                         │
│                │ HTTPS/REST                              │
│                ▼                                         │
│                                                          │
│  Backend (AWS/Azure/Heroku)                             │
│  ┌────────────────────────────┐                         │
│  │  Spring Boot App           │                         │
│  │  Load Balanced             │                         │
│  │  Auto-Scaling              │                         │
│  └────────────────────────────┘                         │
│                │                                         │
│                │ JDBC/JPA                                │
│                ▼                                         │
│                                                          │
│  Database (AWS RDS/Azure DB)                            │
│  ┌────────────────────────────┐                         │
│  │  MySQL/PostgreSQL          │                         │
│  │  Automated Backups         │                         │
│  │  Read Replicas             │                         │
│  └────────────────────────────┘                         │
│                                                          │
│  AI Service (Optional)                                  │
│  ┌────────────────────────────┐                         │
│  │  AWS Rekognition           │                         │
│  │  Azure Face API            │                         │
│  │  Custom OpenCV Server      │                         │
│  └────────────────────────────┘                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

This architecture demonstrates a scalable, maintainable, and production-ready system following industry best practices and the MVC design pattern.
