# SmartSense: AI-IoT Classroom Attendance & Engagement System

## Backend - Spring Boot REST API

---

## Project Structure

```
smartsense-backend/
├── src/main/java/com/smartsense/
│   ├── SmartSenseApplication.java          # Main application class
│   ├── config/
│   │   └── SecurityConfig.java             # Spring Security configuration
│   ├── controller/
│   │   ├── AuthController.java             # Authentication endpoints
│   │   ├── StudentController.java          # Student management endpoints
│   │   ├── AttendanceController.java       # Attendance endpoints
│   │   └── EngagementController.java       # Engagement endpoints
│   ├── service/
│   │   ├── UserService.java                # User business logic
│   │   ├── StudentService.java             # Student business logic
│   │   ├── AttendanceService.java          # Attendance business logic
│   │   └── EngagementService.java          # Engagement business logic
│   ├── repository/
│   │   ├── UserRepository.java             # User data access
│   │   ├── StudentRepository.java          # Student data access
│   │   ├── AttendanceRepository.java       # Attendance data access
│   │   └── EngagementRepository.java       # Engagement data access
│   └── model/
│       ├── User.java                       # User entity
│       ├── Student.java                    # Student entity
│       ├── Attendance.java                 # Attendance entity
│       └── Engagement.java                 # Engagement entity
├── src/main/resources/
│   └── application.properties              # Application configuration
└── pom.xml                                 # Maven dependencies

```

---

## Tech Stack

- **Java**: 17
- **Spring Boot**: 3.2.0
- **Spring Web**: REST API
- **Spring Data JPA**: Database access
- **Spring Security**: Authentication & Authorization
- **H2 Database**: In-memory database
- **Maven**: Build tool

---

## MVC Architecture

### Controller Layer
- **Purpose**: Handle HTTP requests/responses
- **Responsibility**: Delegate to Service layer ONLY
- **Rule**: NO business logic

### Service Layer
- **Purpose**: Business logic implementation
- **Responsibility**: Call Repository layer ONLY
- **Rule**: NO direct HTTP handling

### Repository Layer
- **Purpose**: Database operations
- **Responsibility**: JpaRepository interface
- **Rule**: NO business logic

### Model Layer
- **Purpose**: JPA entities
- **Responsibility**: Database table mapping

### Config Layer
- **Purpose**: Spring Security setup
- **Responsibility**: Authentication and authorization

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);
```

### Students Table
```sql
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    face_id VARCHAR(255)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    date DATE NOT NULL,
    present BOOLEAN NOT NULL
);
```

### Engagement Table
```sql
CREATE TABLE engagement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    engagement_score INTEGER NOT NULL
);
```

---

## Security Configuration

### Roles
- **ADMIN**: Full access to all endpoints
- **TEACHER**: Access to student, attendance, and engagement APIs
- **STUDENT**: Limited access (not implemented in this scope)

### In-Memory Users
```
Username: admin      | Password: admin123     | Role: ADMIN
Username: teacher    | Password: teacher123   | Role: TEACHER
Username: student    | Password: student123   | Role: STUDENT
```

### Security Features
- Basic Authentication
- CSRF disabled
- Method-level security with @PreAuthorize
- H2 console access permitted

---

## API Endpoints

### Authentication

**POST /auth/login**
- Login user with username and password
- Access: Public
- Request:
  ```
  POST /auth/login?username=admin&password=admin123
  ```
- Response:
  ```json
  {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  }
  ```

---

### Student Management

**POST /students/add**
- Add new student
- Access: ADMIN, TEACHER
- Request:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "faceId": "face123"
  }
  ```
- Response:
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "faceId": "face123"
  }
  ```

**GET /students/get**
- Get all students
- Access: ADMIN, TEACHER
- Response:
  ```json
  [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "faceId": "face123"
    }
  ]
  ```

---

### Attendance Management

**POST /attendance/mark**
- Mark attendance for a student
- Access: ADMIN, TEACHER
- Request:
  ```
  POST /attendance/mark?studentId=1&date=2026-04-18&present=true
  ```
- Response:
  ```json
  {
    "id": 1,
    "studentId": 1,
    "date": "2026-04-18",
    "present": true
  }
  ```

**GET /attendance/report**
- Get attendance report for a student
- Access: ADMIN, TEACHER
- Request:
  ```
  GET /attendance/report?studentId=1
  ```
- Response:
  ```json
  [
    {
      "id": 1,
      "studentId": 1,
      "date": "2026-04-18",
      "present": true
    }
  ]
  ```

---

### Engagement Management

**GET /engagement/get**
- Get engagement scores for a student
- Access: ADMIN, TEACHER
- Request:
  ```
  GET /engagement/get?studentId=1
  ```
- Response:
  ```json
  [
    {
      "id": 1,
      "studentId": 1,
      "engagementScore": 85
    }
  ]
  ```

---

## Setup and Run

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Build and Run
```bash
# Navigate to project directory
cd smartsense-backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

### Access
- **Application**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:smartsense_db`
  - Username: `sa`
  - Password: (leave empty)

---

## Testing with cURL

### Login as Admin
```bash
curl -X POST "http://localhost:8080/auth/login?username=admin&password=admin123"
```

### Add Student (with Basic Auth)
```bash
curl -u admin:admin123 -X POST "http://localhost:8080/students/add" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","faceId":"face123"}'
```

### Get All Students
```bash
curl -u teacher:teacher123 -X GET "http://localhost:8080/students/get"
```

### Mark Attendance
```bash
curl -u teacher:teacher123 -X POST \
  "http://localhost:8080/attendance/mark?studentId=1&date=2026-04-18&present=true"
```

### Get Attendance Report
```bash
curl -u admin:admin123 -X GET \
  "http://localhost:8080/attendance/report?studentId=1"
```

---

## Architecture Rules Verification

### ✅ Controller Layer
- Only handles HTTP requests/responses
- Delegates to Service layer
- NO business logic
- Uses @RestController annotation

### ✅ Service Layer
- Contains ALL business logic
- Calls Repository layer
- NO HTTP handling
- Uses @Service annotation

### ✅ Repository Layer
- Database operations only
- Extends JpaRepository
- NO business logic
- Uses @Repository annotation

### ✅ Model Layer
- JPA entities only
- Database table mapping
- Uses @Entity annotation

### ✅ Config Layer
- Spring Security configuration
- In-memory user setup
- Uses @Configuration annotation

---

## Notes

- H2 database is in-memory and will reset on application restart
- CSRF is disabled for testing purposes
- Basic authentication is used (username:password in headers)
- All sensitive endpoints are protected with role-based access control
- Database schema is auto-created on application startup
- SQL queries are logged to console for debugging

---

## License

Educational Project - 2026
