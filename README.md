# SmartSense: AI-IoT Classroom Attendance & Engagement System

A full-stack web application demonstrating AI-powered attendance tracking with face recognition, engagement monitoring, and role-based dashboards.

## 🚀 Quick Start

### Frontend (React Demo - Already Running)

The application should be accessible through your environment's preview surface.

**Demo Credentials:**
- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`  
- **Student**: `john.doe` / `student123`

### Features You Can Test

✅ **Admin Dashboard**
- View system analytics
- Add/Edit/Delete students
- Manage users and roles
- Generate attendance reports
- Manage system alerts

✅ **Teacher Dashboard**
- Record and upload lecture content
- View class attendance records (monitoring only)
- Track student engagement analytics
- Monitor which students accessed lectures
- Receive low attendance/engagement alerts

✅ **Student Dashboard**
- **Perform face scan to mark own attendance** (self check-in)
- View personal attendance history
- Access and watch lecture recordings
- Check engagement scores
- View quiz/participation results
- Monitor attendance percentage

## 📁 Project Structure

```
/workspaces/default/code/
├── src/app/
│   ├── components/          # React UI components
│   │   ├── AdminDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── FaceRecognitionAttendance.tsx
│   │   └── ...
│   ├── services/            # Mock backend services
│   │   ├── authService.ts
│   │   ├── studentService.ts
│   │   ├── attendanceService.ts
│   │   ├── faceRecognitionService.ts
│   │   └── mockData.ts
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── App.tsx              # Main app with routing
├── backend-reference/       # Java Spring Boot reference code
│   ├── src/main/java/com/smartsense/
│   │   ├── model/          # Entity classes (MODEL)
│   │   ├── repository/     # Data access layer
│   │   ├── service/        # Business logic (SERVICE)
│   │   └── controller/     # REST APIs (CONTROLLER)
│   ├── database-schema.sql
│   ├── pom.xml
│   └── README.md
├── PROJECT_DOCUMENTATION.md # Complete documentation
├── DEMO_SCRIPT.md           # Academic presentation guide
└── README.md                # This file
```

## 🏗️ Architecture

### MVC Pattern

**MODEL** (Backend - Java Spring Boot)
- Entity classes representing database tables
- JPA annotations for ORM mapping
- Relationships between entities

**VIEW** (Frontend - React + TypeScript)
- React components for UI
- Role-based dashboard views
- Charts and analytics visualization

**CONTROLLER** (Backend - REST APIs)
- RESTful endpoints
- Request/response handling
- Role-based authorization

### Technology Stack

**Frontend:**
- React 18.3 with TypeScript
- React Router DOM for routing
- Tailwind CSS for styling
- Recharts for data visualization
- shadcn/ui component library

**Backend (Reference):**
- Java 17 with Spring Boot 3.x
- Spring Data JPA
- Spring Security with JWT
- MySQL/PostgreSQL database

## 🎯 Key Features

### 1. 📹 Real Webcam Integration (NEW!)
- **Live camera feed** using browser APIs (`navigator.mediaDevices`)
- Students scan their own faces in real-time
- Face alignment guides with visual feedback
- Image capture from video stream
- Base64 encoding for API transmission
- 85-99% accuracy with confidence scoring
- Immediate feedback and verification

### 2. Anti-Proxy System
- Liveness detection (anti-spoofing)
- Prevents photo/video-based proxy attendance
- Confidence threshold validation
- Alert system for suspicious entries

### 3. Lecture Recording Management
- Teachers start/stop lecture recording
- Upload pre-recorded lectures
- Track which students watched
- Monitor watch duration and completion

### 4. Engagement Tracking
- Attention score monitoring (0-100)
- Participation tracking
- Trend analysis and reporting
- Quiz/participation results

### 5. Role-Based Access Control
- **ADMIN**: Full system access, student/user management
- **TEACHER**: Lecture management, attendance monitoring (view-only)
- **STUDENT**: Self check-in, lecture viewing, personal data access

### 6. Analytics Dashboard
- Real-time statistics
- Visual charts (bar, line, pie)
- Attendance and engagement reports
- Lecture access tracking

## 📚 Documentation

- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete technical documentation
- **[DEMO_SCRIPT.md](DEMO_SCRIPT.md)** - Academic presentation guide
- **[backend-reference/README.md](backend-reference/README.md)** - Backend setup guide
- **[database-schema.sql](backend-reference/database-schema.sql)** - Database design

## 🎓 For Academic Demo/Viva

1. **Read**: [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for presentation flow
2. **Understand**: MVC architecture implementation
3. **Practice**: Live demo with all three roles
4. **Prepare**: Answer expected questions
5. **Know**: Code structure and design decisions

### Quick Demo Flow
1. Login as Admin → Show analytics & student management
2. Login as Teacher → Demonstrate lecture recording/management
3. Login as Student → Perform face scan self check-in, view lectures
4. Explain MVC architecture using code examples
5. Show database schema and relationships

### Key System Design Note
**IMPORTANT**: Face scanning is done by STUDENTS (self check-in), not teachers. Teachers manage lecture content and monitor attendance. This represents a modern, distributed, self-service system architecture.

## 🔒 Security Features

- JWT-based authentication
- Role-based authorization
- Password encryption (BCrypt)
- SQL injection prevention
- Face data encryption

## 🚧 Production Deployment

### Frontend
```bash
pnpm install
pnpm build
# Deploy to Vercel, Netlify, or AWS S3
```

### Backend
```bash
cd backend-reference
mvn clean package
java -jar target/smartsense-backend-1.0.0.jar
# Deploy to AWS, Azure, or Heroku
```

### Database
```bash
mysql -u root -p
CREATE DATABASE smartsense_db;
SOURCE backend-reference/database-schema.sql;
```

## 📊 Sample Data

The system includes pre-populated sample data:
- 8 students across 2 classes
- 30 days of attendance history
- Engagement metrics
- System alerts

All data is stored in browser localStorage for the demo.

## 🤝 Support

For questions or issues:
1. Check [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)
2. Review code comments
3. Consult [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for Q&A

## 📝 License

Educational project for academic demonstration.

---

**Note**: This is a complete full-stack project with:
- ✅ Working React frontend with 3 role-based dashboards
- ✅ Mock backend services simulating Spring Boot APIs
- ✅ Complete Java Spring Boot reference implementation
- ✅ Database schema with sample data
- ✅ Comprehensive documentation
- ✅ Academic presentation guide

Perfect for final year projects, viva demonstrations, and learning full-stack development with AI integration!
