# SmartSense - Role-Based Dashboard System

## Overview

SmartSense implements a **3-tier role-based access control (RBAC)** system with distinct dashboards for **Admin**, **Teacher**, and **Student** roles. Each role has specific permissions and features tailored to their responsibilities.

---

## 🔑 Role Definitions

### ADMIN Role
**Purpose**: System administration and oversight

**Access Level**: Full system access

**Responsibilities**:
- Manage students (add, edit, delete)
- Manage users and roles
- View system-wide analytics
- Access all attendance and engagement data
- Manage system alerts
- Generate comprehensive reports

### TEACHER Role
**Purpose**: Classroom management and monitoring

**Access Level**: Class-level access

**Responsibilities**:
- Record and manage lecture content
- Monitor class attendance (view-only)
- Track student engagement metrics
- Receive and respond to alerts
- View student access to lecture recordings
- Upload/manage course materials

**NOTE**: Teachers do NOT perform face scanning. They monitor and manage the system.

### STUDENT Role
**Purpose**: Self-service and personal tracking

**Access Level**: Personal data only

**Responsibilities**:
- **Perform face scan to mark attendance** (self check-in)
- View personal attendance history
- Access lecture recordings
- View engagement scores
- View quiz/participation results
- Receive personal alerts and notifications

**NOTE**: Face recognition is triggered from the STUDENT side for self-check-in.

---

## 📊 Dashboard Features by Role

### 1. ADMIN DASHBOARD

#### Overview Section
- **Total Students**: System-wide student count
- **Present Today**: Today's attendance summary
- **Absent Today**: Students who haven't checked in
- **Average Engagement**: Overall class engagement metrics

#### Student Management
- **Add Student**
  - Name, Roll Number, Class, Email, Phone
  - Automatic user account creation
  - Face data enrollment option
- **Edit Student**
  - Update student information
  - Modify class assignments
- **Delete Student**
  - Remove student from system
  - Archive historical data

#### Attendance Reports
- **Individual Reports**
  - Per-student attendance percentage
  - Present/Absent/Late breakdown
  - Date range filtering
- **Class Reports**
  - Overall class attendance trends
  - Comparative analysis
- **Export Options**
  - CSV/PDF export
  - Custom date ranges

#### System Alerts
- Low attendance warnings
- Low engagement notifications
- Proxy detection alerts
- System status messages

#### User Management
- Create/edit/delete user accounts
- Assign roles (Admin, Teacher, Student)
- Password management
- Access control settings

---

### 2. TEACHER DASHBOARD

**Key Change**: Teachers DO NOT scan faces. They monitor and manage lectures.

#### Lecture Management Tab

**Start/Stop Recording**
- Click "Start Recording" to begin lecture capture
- Real-time recording duration display
- Click "Stop Recording" to end capture
- Automatic processing and upload

**Upload Recorded Lectures**
- Upload pre-recorded video files
- Add title, subject, description
- Set duration and class assignment
- Thumbnail generation

**Manage Lectures**
- View all uploaded/recorded lectures
- Edit lecture metadata
- Delete lectures
- Archive old content

**Track Student Access**
- View which students accessed each lecture
- See watch duration and completion status
- Monitor engagement with recorded content
- Identify students who haven't watched required content

**Lecture Status**:
- 🔴 **RECORDING**: Currently being recorded
- 🟡 **PROCESSING**: Upload/encoding in progress
- 🟢 **AVAILABLE**: Ready for student access
- ⚪ **ARCHIVED**: No longer active

#### Attendance Records Tab (View-Only)
- View class attendance for selected dates
- See attendance status for all students
- View AI confidence scores
- Filter by class, date, status
- **Cannot modify** - attendance is marked by students

#### Engagement Monitoring Tab
- **Attention Scores**
  - Individual student attention metrics
  - Class average attention
  - Trend analysis over time
- **Participation Scores**
  - Student participation levels
  - Class involvement metrics
  - Engagement charts
- **Alerts**
  - Students with low attention
  - Students with declining participation
  - Students requiring support

#### Alerts Panel
- **Low Attendance Alerts**
  - Students below 75% attendance
  - Absence patterns
- **Low Engagement Alerts**
  - Students with attention < 60%
  - Declining participation trends
- **System Notifications**
  - Lecture upload status
  - System updates

---

### 3. STUDENT DASHBOARD

**Key Change**: Students perform their own face scan for attendance.

#### Face Scan Section (Top Priority)

**Self Check-In Process**:
1. Click "Scan Face to Mark Attendance"
2. Position face in front of camera
3. System captures and verifies face
4. Liveness detection (anti-proxy)
5. Face recognition matching
6. Automatic attendance marking

**Scan Instructions**:
- ✅ Ensure good lighting on face
- ✅ Look directly at camera
- ✅ Remove sunglasses/masks
- ✅ Stay still during scan (3-5 seconds)
- ❌ Do NOT use photos/videos (liveness detection will fail)

**Verification Steps**:
1. **Face Capture**: Image acquired from webcam
2. **Liveness Check**: Confirms real person (not photo/video)
3. **Face Recognition**: Matches against enrolled template
4. **Identity Verification**: Ensures scanned face matches logged-in student
5. **Attendance Marking**: Records presence with timestamp

**Results Display**:
- ✅ Recognition Confidence Score (85-99%)
- ✅ Liveness Score (anti-proxy verification)
- ✅ Attendance Status (PRESENT/LATE)
- ✅ Timestamp of check-in
- ✅ Verification method (AI Face Recognition)

**Error Handling**:
- Low confidence → Retry scan
- Liveness failed → Use real face, not photo
- Wrong person → Scan your own face
- Already marked → Attendance recorded earlier

#### Personal Stats Cards
- **Attendance Rate**
  - Overall percentage
  - Present/Absent/Late breakdown
  - Progress bar visualization
- **Attention Score**
  - Average attention in class (0-100)
  - Trend analysis
- **Participation Score**
  - Class involvement metric (0-100)
  - Engagement level
- **Overall Status**
  - ✅ Good Standing (≥75% attendance)
  - ⚠️ Below Required (<75% attendance)

#### Attendance Tab
- **Recent Records Table**
  - Last 10 attendance entries
  - Date, Status, Time, Method
  - AI confidence scores
  - Face recognition verification indicator

#### Lecture Recordings Tab
- **Available Lectures**
  - Grid view of all class lectures
  - Lecture title, subject, description
  - Duration and upload date
  - Thumbnail preview (if available)
- **Watch Lecture**
  - Click "Watch Lecture" to open video
  - System tracks access and watch duration
  - Progress saved automatically
  - Mark as completed

#### Quiz Results Tab
- **Quiz Performance**
  - Quiz title and subject
  - Score (e.g., 18/20)
  - Percentage (e.g., 90%)
  - Submission date
  - Color-coded badges:
    - 🟢 Green: ≥80% (Excellent)
    - 🟡 Yellow: 60-79% (Good)
    - 🔴 Red: <60% (Needs Improvement)

#### Alerts & Notifications
- **Low Attendance Warning**
  - Alert when below 75%
  - Required minimum notice
- **Engagement Reminders**
  - Low attention score notifications
  - Participation improvement suggestions
- **Course Notifications**
  - New lecture uploaded
  - Quiz deadlines
  - Important announcements

---

## 🔒 Security & Access Control

### Authentication Flow

```
1. User Login
   ↓
2. Credentials Validated (username + password)
   ↓
3. JWT Token Generated
   ↓
4. Role Retrieved from Database
   ↓
5. Redirect to Role-Specific Dashboard
   ├─ ADMIN → Admin Dashboard
   ├─ TEACHER → Teacher Dashboard
   └─ STUDENT → Student Dashboard
```

### Authorization Rules

**Route Protection**:
```
/admin     → Requires ADMIN role
/teacher   → Requires TEACHER role
/student   → Requires STUDENT role
```

**API Endpoint Access**:
```
POST /students/add              → ADMIN only
GET /students/get               → ADMIN, TEACHER
PUT /students/update/{id}       → ADMIN only
DELETE /students/delete/{id}    → ADMIN only

GET /attendance/all             → ADMIN, TEACHER
POST /attendance/mark           → STUDENT (self), ADMIN (manual)
GET /attendance/student/{id}    → ADMIN, TEACHER, STUDENT (own)

POST /lectures/start-recording  → TEACHER only
POST /lectures/upload           → TEACHER only
GET /lectures/class/{class}     → TEACHER, STUDENT (own class)

GET /quiz/student/{id}          → STUDENT (own), TEACHER, ADMIN
```

---

## 🎯 Key Differences from Traditional Systems

### Traditional System
- ❌ Teacher scans student faces manually
- ❌ Students passively wait to be marked
- ❌ Centralized attendance marking
- ❌ Teacher handles all verification

### SmartSense System
- ✅ Students scan their own faces (self check-in)
- ✅ Students are actively responsible for attendance
- ✅ Distributed attendance marking
- ✅ AI handles verification automatically
- ✅ Teachers monitor and manage lectures
- ✅ Real-time alerts for anomalies

---

## 💡 Benefits of Student-Initiated Face Scan

### For Students
1. **Convenience**: Mark attendance from their own device
2. **Transparency**: Immediate feedback on scan results
3. **Accountability**: Takes responsibility for check-in
4. **Privacy**: No centralized face scanning queue

### For Teachers
1. **Time Saving**: No manual face scanning
2. **Focus on Teaching**: Can start class immediately
3. **Monitoring**: View attendance in real-time
4. **Content Management**: Focus on lecture recording/upload

### For System
1. **Scalability**: Multiple students can scan simultaneously
2. **Efficiency**: Parallel processing
3. **Accuracy**: Students verify their own identity
4. **Anti-Proxy**: Liveness detection per student

---

## 🚨 Alert System

### Alert Types

**LOW_ATTENDANCE**
- Triggered: Attendance < 75%
- Severity: WARNING
- Recipients: Student, Teacher, Admin
- Action: Student must improve attendance

**LOW_ENGAGEMENT**
- Triggered: Attention/Participation < 60%
- Severity: INFO
- Recipients: Student, Teacher
- Action: Student should focus more in class

**PROXY_DETECTED**
- Triggered: Liveness check failed OR low confidence (<85%)
- Severity: CRITICAL
- Recipients: Teacher, Admin
- Action: Manual verification required

**SYSTEM**
- Triggered: System events (updates, maintenance)
- Severity: INFO
- Recipients: All users
- Action: Informational only

---

## 📱 Workflow Examples

### Example 1: Student Marking Attendance

```
1. Student arrives to class
2. Opens SmartSense on phone/laptop
3. Logs in with credentials
4. Navigates to Student Dashboard
5. Clicks "Scan Face to Mark Attendance"
6. Positions face in camera view
7. AI performs:
   - Face capture
   - Liveness detection
   - Face recognition
   - Identity verification
8. System displays:
   - ✅ Attendance Marked
   - 95% Confidence
   - 92% Liveness Score
9. Student sees confirmation
10. Attendance recorded in database
```

### Example 2: Teacher Managing Lectures

```
1. Teacher starts class
2. Logs into SmartSense
3. Navigates to Teacher Dashboard
4. Clicks "Lecture Management" tab
5. Clicks "Start Recording"
6. System begins recording lecture
7. Duration timer runs
8. Teacher teaches normally
9. After class, clicks "Stop Recording"
10. System processes and uploads
11. Students receive notification
12. Students can watch recording
13. Teacher views access logs
```

### Example 3: Admin Investigating Alert

```
1. Admin logs in
2. Sees CRITICAL alert: "Proxy Detected - John Doe"
3. Clicks alert for details
4. Views:
   - Confidence: 65% (below threshold)
   - Liveness: 55% (failed)
   - Timestamp and attempt details
5. Checks student's face data enrollment
6. Reviews recent attendance pattern
7. Contacts teacher for manual verification
8. Marks alert as resolved after confirmation
```

---

## 🎓 Educational Value

This role-based system demonstrates:

1. **Real-World RBAC**: Industry-standard access control
2. **Self-Service Architecture**: Modern UX pattern
3. **Distributed Systems**: Parallel processing
4. **AI Integration**: Face recognition in production
5. **Security Best Practices**: Authentication + Authorization
6. **Microservices Pattern**: Service-oriented architecture
7. **Event-Driven Design**: Real-time alerts and notifications

---

## 📚 Summary

| Feature | Admin | Teacher | Student |
|---------|-------|---------|---------|
| **Face Scanning** | ❌ (manual override only) | ❌ (view results) | ✅ (self check-in) |
| **Lecture Recording** | ❌ | ✅ (create/manage) | ❌ (view only) |
| **Lecture Viewing** | ✅ | ✅ | ✅ (own class) |
| **Attendance Marking** | ✅ (manual) | ❌ (view only) | ✅ (via face scan) |
| **Student Management** | ✅ (full CRUD) | ❌ (view only) | ❌ |
| **Engagement Monitoring** | ✅ (all students) | ✅ (own classes) | ✅ (personal) |
| **Quiz Results** | ✅ (all) | ✅ (own classes) | ✅ (personal) |
| **System Alerts** | ✅ (manage) | ✅ (view/respond) | ✅ (personal) |
| **User Management** | ✅ (full access) | ❌ | ❌ |

---

**This role-based system provides a realistic, scalable, and secure architecture suitable for production deployment in educational institutions.**
