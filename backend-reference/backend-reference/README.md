# SmartSense: AI-IoT Classroom Attendance & Engagement System - Backend

## Overview

This is the **Java Spring Boot backend** for the SmartSense system, implementing strict **MVC (Model-View-Controller)** architecture with proper layer separation.

## Technology Stack

- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: MySQL / PostgreSQL
- **ORM**: Spring Data JPA
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Face Recognition**: OpenCV integration ready

## Complete Project Structure

```
backend-reference/
├── pom.xml                              # Maven dependencies
├── database-schema.sql                  # Database schema
├── README.md                            # This file
└── src/main/
    ├── java/com/smartsense/
    │   ├── SmartSenseApplication.java          # Main application entry point
    │   ├── config/                              # Configuration layer
    │   │   ├── SecurityConfig.java              # Spring Security + JWT + CORS config
    │   │   ├── JwtUtil.java                     # JWT token generation/validation
    │   │   ├── JwtAuthenticationFilter.java     # JWT request interceptor
    │   │   └── JwtAuthenticationEntryPoint.java # Auth error handling
    │   ├── controller/                          # Controller layer (REST endpoints ONLY)
    │   │   ├── AuthController.java              # Login/Register endpoints
    │   │   ├── AttendanceController.java        # Attendance REST endpoints
    │   │   ├── StudentController.java           # Student management endpoints
    │   │   ├── EngagementController.java        # Engagement tracking endpoints
    │   │   ├── LectureController.java           # Lecture management endpoints
    │   │   └── DashboardController.java         # Dashboard & alerts endpoints
    │   ├── service/                             # Service layer (BUSINESS LOGIC ONLY)
    │   │   ├── UserDetailsServiceImpl.java      # Spring Security user loading
    │   │   ├── AttendanceService.java           # Attendance business logic
    │   │   ├── FaceRecognitionService.java      # Face recognition logic
    │   │   ├── EngagementService.java           # Engagement calculations
    │   │   ├── LectureService.java              # Lecture management logic
    │   │   └── DashboardService.java            # Dashboard data aggregation
    │   ├── repository/                          # Repository layer (DATA ACCESS ONLY)
    │   │   ├── UserRepository.java              # User JPA repository
    │   │   ├── StudentRepository.java           # Student JPA repository
    │   │   ├── AttendanceRepository.java        # Attendance queries
    │   │   ├── EngagementRepository.java        # Engagement queries
    │   │   ├── AlertRepository.java             # Alert queries
    │   │   ├── LectureRepository.java           # Lecture queries
    │   │   ├── LectureAccessRepository.java     # Access tracking queries
    │   │   └── QuizResultRepository.java        # Quiz result queries
    │   └── model/                               # Model layer (ENTITIES ONLY)
    │       ├── User.java                        # User entity (authentication)
    │       ├── Student.java                     # Student entity
    │       ├── Attendance.java                  # Attendance records
    │       ├── Engagement.java                  # Engagement scores
    │       ├── Alert.java                       # System alerts
    │       ├── Lecture.java                     # Lecture recordings
    │       ├── LectureAccess.java               # Student access logs
    │       └── QuizResult.java                  # Quiz/participation results
    └── resources/
        └── application.properties               # Application configuration
```

## MVC Architecture Explained

### **Strict Layer Separation Rules**

This backend follows **strict MVC architecture** with clear separation of concerns:

| Layer | Purpose | What It CAN Do | What It CANNOT Do |
|-------|---------|----------------|-------------------|
| **Model** | Data structure | Define entities, relationships, JPA annotations | Business logic, data access queries |
| **Repository** | Data access | JPA queries, CRUD operations, custom @Query | Business logic, REST handling |
| **Service** | Business logic | Validation, calculations, orchestration | REST handling, direct database access |
| **Controller** | REST API | HTTP handling, @PreAuthorize, delegate to service | Business logic, direct data access |
| **Config** | Configuration | Security setup, JWT, CORS | Business logic, REST handling |

### **Data Flow (Request → Response)**

```
Client Request (JSON/HTTP)
    ↓
[1] Controller Layer
    - Receives HTTP request
    - Validates authentication (JWT)
    - Checks authorization (@PreAuthorize)
    - Extracts request parameters
    - Delegates to Service layer
    ↓
[2] Service Layer
    - Implements business logic
    - Validates business rules
    - Orchestrates operations
    - Calls Repository layer
    ↓
[3] Repository Layer
    - Executes JPA queries
    - CRUD operations
    - Custom database queries
    ↓
[4] Model Layer (Entity)
    - JPA entity mapping
    - Database table representation
    ↓
Database (MySQL/PostgreSQL)
```

### **Example: Student Marking Attendance via Face Scan**

```
POST /attendance/mark
Content-Type: application/json
Authorization: Bearer <jwt_token>
Body: { "imageData": "base64...", "studentId": 123 }

    ↓

[AttendanceController.java]
@PostMapping("/mark")
@PreAuthorize("hasRole('STUDENT')")  // Role check
public ResponseEntity<?> markAttendance(
    @RequestParam String imageData,
    @RequestParam Long studentId
) {
    // 1. Extract parameters
    // 2. Delegate to service (NO business logic here)
    return attendanceService.markAttendance(...);
}

    ↓

[AttendanceService.java]
public Attendance markAttendance(...) {
    // 1. Check if already marked today (business rule)
    if (isAttendanceMarkedToday(studentId)) {
        throw new IllegalStateException("Already marked");
    }
    
    // 2. Call face recognition service
    FaceRecognitionResult result = 
        faceRecognitionService.recognizeFace(imageData);
    
    // 3. Validate confidence threshold (business rule)
    if (result.getConfidence() < 0.7) {
        throw new IllegalArgumentException("Low confidence");
    }
    
    // 4. Create attendance entity
    Attendance attendance = new Attendance();
    attendance.setStudent(...);
    attendance.setStatus(Status.PRESENT);
    attendance.setConfidence(result.getConfidence());
    
    // 5. Save via repository (NO direct DB access)
    return attendanceRepository.save(attendance);
}

    ↓

[AttendanceRepository.java]
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // JPA handles the actual database operation
    // save() is inherited from JpaRepository
}

    ↓

[Attendance.java - Model/Entity]
@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne
    private Student student;
    
    private Status status;
    private Double confidence;
    
    // Mapped to database table columns
}

    ↓

Database INSERT INTO attendance (student_id, status, confidence, ...)
```

## Setup Instructions

### 1. Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL or PostgreSQL database
- (Optional) OpenCV for face recognition

### 2. Database Setup

Create a database named `smartsense_db`:

```sql
CREATE DATABASE smartsense_db;
```

### 3. Application Properties

Edit `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/smartsense_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
jwt.secret=your_secret_key_here
jwt.expiration=86400000
```

### 4. Build and Run

```bash
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## Key Features

### 1. **JWT Authentication & Authorization**
- Stateless token-based authentication
- Role-based access control (RBAC)
- Roles: ADMIN, TEACHER, STUDENT
- Method-level security with @PreAuthorize

### 2. **Face Recognition System**
- Face data storage (Base64 encoding)
- Face matching service (OpenCV integration ready)
- Liveness detection placeholder
- Confidence score tracking
- Anti-proxy attendance prevention

### 3. **Role-Based Permissions**

| Role | Permissions |
|------|------------|
| **ADMIN** | Full system access, user management, delete operations, view all data |
| **TEACHER** | Create/manage lectures, view class attendance, monitor engagement, create alerts |
| **STUDENT** | Self check-in via face scan, view own data, access lectures, view own engagement |

### 4. **Self-Service Attendance**
- Students mark their own attendance (distributed system)
- Face recognition verification
- Duplicate prevention (one attendance per day)
- Confidence score validation
- Manual override capability (for admins)

### 5. **Engagement Tracking**
- Attention score monitoring (0-100)
- Participation score tracking (0-100)
- Low engagement detection and alerts
- Class-level and student-level analytics

### 6. **Lecture Management**
- Start/stop recording functionality
- Video upload and storage
- Student access tracking
- Watch duration monitoring
- Quiz result tracking

## Complete API Endpoints

### Authentication (`/auth/*`)

```
POST /auth/login                 # Login and get JWT token
POST /auth/register              # Register new user (any role)
```

**Request (Login):**
```json
{
  "username": "student123",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "username": "student123",
  "role": "STUDENT",
  "userId": 45
}
```

### Students (`/students/*`)

```
POST   /students/register           # Register student (ADMIN/TEACHER)
GET    /students/all                # Get all students (TEACHER/ADMIN)
GET    /students/{id}               # Get student by ID (STUDENT own/TEACHER/ADMIN)
GET    /students/class/{className}  # Get students in class (TEACHER/ADMIN)
PUT    /students/{id}               # Update student (STUDENT own/ADMIN)
PUT    /students/{id}/face-data     # Update face data (STUDENT)
DELETE /students/{id}               # Delete student (ADMIN)
```

### Attendance (`/attendance/*`)

```
POST   /attendance/mark                      # Mark attendance via face scan (STUDENT)
GET    /attendance/student/{studentId}       # Get student attendance (STUDENT own/TEACHER/ADMIN)
GET    /attendance/class/{className}         # Get class attendance (TEACHER/ADMIN)
GET    /attendance/date/{date}               # Get attendance by date (TEACHER/ADMIN)
GET    /attendance/today                     # Get today's attendance (TEACHER/ADMIN)
POST   /attendance/manual                    # Manual attendance (ADMIN)
DELETE /attendance/{id}                      # Delete attendance (ADMIN)
```

**Mark Attendance Request:**
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "studentId": 123
}
```

### Engagement (`/engagement/*`)

```
POST /engagement/record                      # Record engagement data (TEACHER/ADMIN)
GET  /engagement/student/{studentId}         # Get student engagement history (STUDENT own/TEACHER/ADMIN)
GET  /engagement/student/{studentId}/average # Get average scores (STUDENT own/TEACHER/ADMIN)
GET  /engagement/class/{className}           # Get class engagement (TEACHER/ADMIN)
GET  /engagement/low?threshold=60            # Find low engagement students (TEACHER/ADMIN)
```

**Record Engagement:**
```json
{
  "studentId": 123,
  "attentionScore": 85,
  "participationScore": 90,
  "className": "10-A"
}
```

### Lectures (`/lectures/*`)

```
POST   /lectures/create                # Create lecture (TEACHER)
POST   /lectures/start-recording       # Start recording (TEACHER)
POST   /lectures/{id}/stop-recording   # Stop recording (TEACHER)
GET    /lectures/all                   # Get all lectures (TEACHER/ADMIN)
GET    /lectures/class/{className}     # Get class lectures (STUDENT/TEACHER/ADMIN)
GET    /lectures/teacher/{teacherId}   # Get teacher lectures (TEACHER/ADMIN)
POST   /lectures/{id}/record-access    # Record student access (STUDENT)
GET    /lectures/{id}/access           # Get access logs (TEACHER/ADMIN)
DELETE /lectures/{id}                  # Delete lecture (TEACHER/ADMIN)
```

**Start Recording:**
```json
{
  "title": "Introduction to Algebra",
  "subject": "Mathematics",
  "className": "10-A",
  "teacherId": 5,
  "teacherName": "Mr. Smith"
}
```

### Dashboard (`/dashboard/*`)

```
GET    /dashboard/summary             # Get summary statistics (TEACHER/ADMIN)
GET    /dashboard/alerts              # Get all alerts (TEACHER/ADMIN)
GET    /dashboard/alerts/unresolved   # Get unresolved alerts (TEACHER/ADMIN)
POST   /dashboard/alert               # Create new alert (TEACHER/ADMIN)
PUT    /dashboard/alert/{id}/resolve  # Resolve alert (TEACHER/ADMIN)
DELETE /dashboard/alert/{id}          # Delete alert (ADMIN)
```

**Dashboard Summary Response:**
```json
{
  "totalStudents": 250,
  "totalLectures": 120,
  "totalAttendanceRecords": 5400,
  "unresolvedAlerts": 8,
  "todayAttendance": 230,
  "thisWeekLectures": 15,
  "lowEngagementStudents": 12
}
```

## Face Recognition Integration

The system is designed for OpenCV integration. See `FaceRecognitionService.java` for the implementation.

### Current Implementation (Mock/Development)

The service currently returns mock results for development:

```java
public FaceRecognitionResult recognizeFace(String imageData) {
    // Mock implementation for development
    // Returns simulated confidence score
    return new FaceRecognitionResult(true, 0.95, studentId);
}
```

### Production Integration Options

#### Option 1: OpenCV (Local - Recommended for Privacy)

Add Maven dependency:
```xml
<dependency>
    <groupId>org.openpnp</groupId>
    <artifactId>opencv</artifactId>
    <version>4.7.0-0</version>
</dependency>
```

Implement in `FaceRecognitionService.java`:
```java
// Load OpenCV library
static {
    nu.pattern.OpenCV.loadShared();
}

// Face detection using Haar Cascade
CascadeClassifier faceDetector = new CascadeClassifier(
    "haarcascade_frontalface_default.xml"
);

// Face recognition using LBPH
LBPHFaceRecognizer recognizer = LBPHFaceRecognizer.create();
```

#### Option 2: Cloud APIs (Easier Setup)

**AWS Rekognition:**
```java
AmazonRekognition client = AmazonRekognitionClientBuilder.defaultClient();
CompareFacesRequest request = new CompareFacesRequest()
    .withSourceImage(sourceImage)
    .withTargetImage(targetImage);
```

**Azure Face API:**
```java
FaceClient faceClient = new FaceClientBuilder()
    .endpoint(endpoint)
    .credential(credential)
    .buildClient();
```

**Google Cloud Vision:**
```java
ImageAnnotatorClient vision = ImageAnnotatorClient.create();
FaceAnnotation face = vision.detectFaces(image);
```

### Liveness Detection

Prevent photo/video proxy attacks:

```java
public boolean checkLiveness(String imageData) {
    // 1. Blink detection
    // 2. Head movement
    // 3. Texture analysis (detect photo vs real face)
    // 4. Depth sensing (if hardware supports)
}
```

## Security Features

### 1. JWT Token Security

```java
// Token generation with 24-hour expiration
String token = jwtUtil.generateToken(userDetails);

// Token validation on every request
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    // Intercepts requests
    // Validates JWT token
    // Sets SecurityContext authentication
}
```

### 2. Role-Based Access Control (RBAC)

```java
// Controller-level authorization
@PreAuthorize("hasRole('ADMIN')")           // Admin only
@PreAuthorize("hasRole('TEACHER')")         // Teacher only
@PreAuthorize("hasRole('STUDENT')")         // Student only
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")  // Multiple roles
```

### 3. Password Security

```java
// BCrypt password hashing
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// Passwords are never stored in plain text
user.setPassword(passwordEncoder.encode(rawPassword));
```

### 4. CORS Configuration

```java
// SecurityConfig.java
configuration.setAllowedOrigins(Arrays.asList("*"));  // Dev only
// Production: specify exact frontend URLs
configuration.setAllowedOrigins(Arrays.asList("https://app.smartsense.com"));
```

### 5. SQL Injection Prevention

```java
// JPA automatically prevents SQL injection
@Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId")
List<Attendance> findByStudentId(@Param("studentId") Long studentId);
```

## Code Quality Rules & Best Practices

### ✅ DO's

- **DO** keep Controller thin - only REST handling
- **DO** put all business logic in Service layer
- **DO** use @Transactional on Service methods
- **DO** validate input in Service layer
- **DO** use proper HTTP status codes (200, 201, 400, 401, 404, 500)
- **DO** use @PreAuthorize for access control
- **DO** return meaningful error messages
- **DO** use DTOs for complex request/response objects

### ❌ DON'Ts

- **DON'T** put business logic in Controller
- **DON'T** handle REST requests in Service
- **DON'T** access database directly in Service (use Repository)
- **DON'T** put business logic in Repository (only queries)
- **DON'T** mix layers (Controller → Service → Repository → Model)
- **DON'T** expose entity classes directly (use DTOs)
- **DON'T** return null (use Optional or throw exception)
- **DON'T** ignore security (always use @PreAuthorize)

### Example: Proper Layer Separation

**❌ BAD (Logic in Controller):**
```java
@PostMapping("/mark")
public ResponseEntity<?> markAttendance(...) {
    // BAD: Business logic in controller
    if (attendanceRepository.existsByStudentIdAndDate(studentId, today)) {
        return ResponseEntity.badRequest().body("Already marked");
    }
    Attendance att = new Attendance();
    attendanceRepository.save(att);  // BAD: Direct repository access
    return ResponseEntity.ok(att);
}
```

**✅ GOOD (Delegate to Service):**
```java
@PostMapping("/mark")
public ResponseEntity<?> markAttendance(...) {
    // GOOD: Delegate to service
    Attendance att = attendanceService.markAttendance(studentId, imageData);
    return ResponseEntity.ok(att);
}
```

## Testing

### Unit Testing

```bash
mvn test
```

### Manual API Testing with cURL

**1. Register User:**
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@smartsense.com",
    "role": "ADMIN"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**3. Use JWT Token:**
```bash
TOKEN="<your_jwt_token_here>"

curl -X GET http://localhost:8080/students/all \
  -H "Authorization: Bearer $TOKEN"
```

**4. Mark Attendance (Student):**
```bash
curl -X POST http://localhost:8080/attendance/mark \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,/9j/4AAQ...",
    "studentId": 123
  }'
```

## Database Schema

See `database-schema.sql` for complete schema. Key tables:

### Core Tables

**users** - Authentication and roles
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL
);
```

**students** - Student information
```sql
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    face_data TEXT,  -- Base64 encoded face features
    registered_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**attendance** - Attendance records
```sql
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    verification_method ENUM('FACE_RECOGNITION', 'MANUAL', 'RFID') NOT NULL,
    confidence DOUBLE,
    captured_image TEXT,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE KEY unique_attendance (student_id, date)
);
```

**engagement** - Engagement tracking
```sql
CREATE TABLE engagement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    date DATE NOT NULL,
    attention_score INT CHECK (attention_score BETWEEN 0 AND 100),
    participation_score INT CHECK (participation_score BETWEEN 0 AND 100),
    class_name VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

**lectures** - Lecture recordings
```sql
CREATE TABLE lectures (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(100),
    class_name VARCHAR(20) NOT NULL,
    teacher_id BIGINT NOT NULL,
    teacher_name VARCHAR(100),
    duration INT,  -- in minutes
    recording_url VARCHAR(500),
    status ENUM('RECORDING', 'PROCESSING', 'AVAILABLE') NOT NULL,
    lecture_date TIMESTAMP,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**lecture_access** - Student access tracking
```sql
CREATE TABLE lecture_access (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lecture_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    student_name VARCHAR(100),
    access_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    watch_duration INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (lecture_id) REFERENCES lectures(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

**alerts** - System notifications
```sql
CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT,
    message TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    alert_type VARCHAR(50),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
```

## Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: Could not create connection to database server
```
Solution:
- Verify database is running: `mysql -u root -p`
- Check `application.properties` connection URL
- Verify username and password
- Ensure database `smartsense_db` exists

**2. JWT Token Error**
```
Error: The specified key byte array is 128 bits which is not secure enough
```
Solution:
- JWT secret must be at least 256 bits (32 characters)
- Update in `application.properties`:
```properties
jwt.secret=SmartSense2026SecretKeyForJWTTokenGenerationAndValidation
```

**3. CORS Error**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
Solution:
- Check `SecurityConfig.java` CORS configuration
- For development, use `setAllowedOrigins(Arrays.asList("*"))`
- For production, specify exact frontend URL

**4. @PreAuthorize Not Working**
```
Error: Access Denied
```
Solution:
- Ensure `@EnableMethodSecurity(prePostEnabled = true)` in SecurityConfig
- Check JWT token includes role claim
- Verify role format: "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT"

**5. Maven Build Error**
```
Error: Failed to execute goal
```
Solution:
```bash
# Clean and rebuild
mvn clean install -U

# Skip tests if needed (for development)
mvn clean install -DskipTests
```

**6. Port Already in Use**
```
Error: Port 8080 is already in use
```
Solution:
- Change port in `application.properties`:
```properties
server.port=8081
```
Or kill existing process:
```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

## Adding New Features

Follow this checklist to add a new feature:

### Step 1: Create Model (Entity)

```java
@Entity
@Table(name = "feature_name")
public class FeatureName {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Add fields with JPA annotations
    // Add getters/setters
}
```

### Step 2: Create Repository

```java
@Repository
public interface FeatureNameRepository extends JpaRepository<FeatureName, Long> {
    // Add custom query methods if needed
    List<FeatureName> findByUserId(Long userId);
    
    @Query("SELECT f FROM FeatureName f WHERE f.status = :status")
    List<FeatureName> findByStatus(@Param("status") String status);
}
```

### Step 3: Create Service

```java
@Service
@Transactional
public class FeatureNameService {
    
    @Autowired
    private FeatureNameRepository repository;
    
    public FeatureName create(FeatureName entity) {
        // Add validation
        // Add business logic
        return repository.save(entity);
    }
    
    public List<FeatureName> getAll() {
        return repository.findAll();
    }
}
```

### Step 4: Create Controller

```java
@RestController
@RequestMapping("/feature-name")
@CrossOrigin(origins = "*")
public class FeatureNameController {
    
    @Autowired
    private FeatureNameService service;
    
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<FeatureName> create(@RequestBody FeatureName entity) {
        FeatureName created = service.create(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<FeatureName>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }
}
```

### Step 5: Test

```bash
# Register test user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","role":"ADMIN"}'

# Login and get token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Test your endpoint
curl -X GET http://localhost:8080/feature-name/all \
  -H "Authorization: Bearer <token>"
```

## Production Deployment

### 1. Prepare for Production

Update `application.properties`:
```properties
# Database - use production credentials
spring.datasource.url=jdbc:mysql://production-db-host:3306/smartsense_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# JPA - NEVER use 'update' in production
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# JWT - use environment variable
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# CORS - restrict to frontend domain
# Update SecurityConfig.java:
configuration.setAllowedOrigins(Arrays.asList("https://app.smartsense.com"));

# Logging
logging.level.root=WARN
logging.level.com.smartsense=INFO
```

### 2. Build Production JAR

```bash
# Build with production profile
mvn clean package -DskipTests

# JAR file created at:
# target/smartsense-0.0.1-SNAPSHOT.jar
```

### 3. Run Production Server

```bash
# Using environment variables
export DB_USERNAME=prod_user
export DB_PASSWORD=prod_password
export JWT_SECRET=YourSecureProductionSecretKey

java -jar target/smartsense-0.0.1-SNAPSHOT.jar
```

### 4. Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM openjdk:17-slim
WORKDIR /app
COPY target/smartsense-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
docker build -t smartsense-backend .
docker run -p 8080:8080 \
  -e DB_USERNAME=prod_user \
  -e DB_PASSWORD=prod_password \
  -e JWT_SECRET=secret \
  smartsense-backend
```

### 5. Cloud Platform Deployment

**AWS Elastic Beanstalk:**
```bash
eb init
eb create smartsense-env
eb deploy
```

**Google Cloud Run:**
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/smartsense
gcloud run deploy --image gcr.io/PROJECT-ID/smartsense
```

**Heroku:**
```bash
heroku create smartsense-backend
git push heroku main
heroku config:set JWT_SECRET=your_secret
```

## Performance Optimization

### 1. Database Indexing

```sql
-- Index frequently queried columns
CREATE INDEX idx_student_roll ON students(roll_number);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
```

### 2. JPA Query Optimization

```java
// Use JOIN FETCH to avoid N+1 queries
@Query("SELECT a FROM Attendance a JOIN FETCH a.student WHERE a.date = :date")
List<Attendance> findByDateWithStudent(@Param("date") LocalDate date);
```

### 3. Caching

```java
@Cacheable("students")
public List<Student> getAllStudents() {
    return studentRepository.findAll();
}
```

## License

Educational Project - SmartSense 2026

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review the MVC Architecture explanation
3. Verify layer separation rules
4. Check code examples in this README
