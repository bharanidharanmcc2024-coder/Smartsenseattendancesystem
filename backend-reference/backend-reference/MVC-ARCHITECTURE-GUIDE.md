# SmartSense - MVC Architecture Guide

## Overview

This document explains the **strict MVC (Model-View-Controller)** architecture implementation in the SmartSense backend.

## What is MVC?

MVC is an architectural pattern that separates application into three main logical components:

- **Model**: Data structure and persistence
- **View**: User interface (in our case, REST API responses)
- **Controller**: Handles requests and coordinates between Model and View

## SmartSense Layer Architecture

In Spring Boot, we extend MVC with additional layers for better separation:

```
┌─────────────────────────────────────────────────┐
│  CLIENT (React Frontend)                        │
│  - Sends HTTP requests                          │
│  - Receives JSON responses                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓ HTTP Request (JSON + JWT Token)
┌─────────────────────────────────────────────────┐
│  CONTROLLER LAYER                               │
│  - Receives HTTP requests                       │
│  - Validates JWT token (@PreAuthorize)          │
│  - Extracts request parameters                  │
│  - Delegates to Service layer                   │
│  - Returns HTTP responses                       │
│                                                  │
│  Files: *Controller.java                        │
│  Annotations: @RestController, @RequestMapping  │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓ Method call (Java objects)
┌─────────────────────────────────────────────────┐
│  SERVICE LAYER (Business Logic)                 │
│  - Validates business rules                     │
│  - Performs calculations                        │
│  - Orchestrates operations                      │
│  - Calls Repository layer                       │
│                                                  │
│  Files: *Service.java                           │
│  Annotations: @Service, @Transactional          │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓ Repository method call
┌─────────────────────────────────────────────────┐
│  REPOSITORY LAYER (Data Access)                 │
│  - JPA query execution                          │
│  - CRUD operations                              │
│  - Custom database queries                      │
│                                                  │
│  Files: *Repository.java                        │
│  Annotations: @Repository                       │
│  Interface: extends JpaRepository               │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓ JPA Entity mapping
┌─────────────────────────────────────────────────┐
│  MODEL LAYER (Entity/Domain)                    │
│  - Defines data structure                       │
│  - JPA entity mapping                           │
│  - Database table representation                │
│                                                  │
│  Files: *.java (in model package)               │
│  Annotations: @Entity, @Table, @Id, etc.        │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓ SQL Queries
┌─────────────────────────────────────────────────┐
│  DATABASE (MySQL/PostgreSQL)                    │
│  - Persistent data storage                      │
│  - Tables, indexes, constraints                 │
└─────────────────────────────────────────────────┘
```

## Strict Layer Separation Rules

### ✅ Controller Layer - CAN DO:
- Receive HTTP requests
- Extract request parameters (`@RequestParam`, `@PathVariable`, `@RequestBody`)
- Validate authentication via JWT
- Check authorization (`@PreAuthorize`)
- Delegate to Service layer
- Return HTTP responses (`ResponseEntity`)
- Handle HTTP status codes (200, 201, 400, 401, 404, 500)

### ❌ Controller Layer - CANNOT DO:
- Business logic (validation, calculations)
- Direct database access
- Call Repository directly
- Complex data transformations
- Make business decisions

### Controller Example:

```java
@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    
    @Autowired
    private AttendanceService attendanceService;  // Inject service
    
    @PostMapping("/mark")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> markAttendance(
        @RequestParam String imageData,
        @RequestParam Long studentId
    ) {
        // ✅ GOOD: Extract parameters, delegate to service
        Attendance attendance = attendanceService.markAttendance(
            studentId, imageData
        );
        return ResponseEntity.ok(attendance);
        
        // ❌ BAD: Would be doing business logic in controller
        // if (attendanceRepository.existsByStudentId(studentId)) { ... }
    }
}
```

---

### ✅ Service Layer - CAN DO:
- Implement business logic
- Validate business rules
- Perform calculations
- Orchestrate multiple operations
- Call other services
- Call Repository layer
- Throw business exceptions
- Create/modify entities

### ❌ Service Layer - CANNOT DO:
- Handle HTTP requests/responses
- Access `@RequestParam`, `@PathVariable`
- Return `ResponseEntity`
- Use `@GetMapping`, `@PostMapping`
- Direct SQL queries (use Repository)
- Access HttpServletRequest

### Service Example:

```java
@Service
@Transactional
public class AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private FaceRecognitionService faceRecognitionService;
    
    public Attendance markAttendance(Long studentId, String imageData) {
        // ✅ GOOD: Business logic
        
        // 1. Validate business rule - check duplicate
        if (isAttendanceMarkedToday(studentId)) {
            throw new IllegalStateException(
                "Attendance already marked today"
            );
        }
        
        // 2. Get student
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Student not found"
            ));
        
        // 3. Call face recognition service
        FaceRecognitionResult result = 
            faceRecognitionService.recognizeFace(imageData);
        
        // 4. Validate confidence threshold
        if (result.getConfidence() < 0.7) {
            throw new IllegalArgumentException(
                "Face recognition confidence too low"
            );
        }
        
        // 5. Create attendance entity
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setDate(LocalDate.now());
        attendance.setStatus(Attendance.Status.PRESENT);
        attendance.setVerificationMethod(
            Attendance.VerificationMethod.FACE_RECOGNITION
        );
        attendance.setConfidence(result.getConfidence());
        attendance.setCapturedImage(imageData);
        attendance.setMarkedAt(LocalDateTime.now());
        
        // 6. Save via repository
        return attendanceRepository.save(attendance);
        
        // ❌ BAD: Would be handling HTTP in service
        // return ResponseEntity.ok(attendance);
    }
    
    private boolean isAttendanceMarkedToday(Long studentId) {
        return attendanceRepository.existsByStudentIdAndDate(
            studentId, LocalDate.now()
        );
    }
}
```

---

### ✅ Repository Layer - CAN DO:
- Extend `JpaRepository<Entity, ID>`
- Define custom query methods
- Use `@Query` annotation for JPQL/SQL
- CRUD operations (inherited from JpaRepository)
- Database queries only

### ❌ Repository Layer - CANNOT DO:
- Business logic
- Validation
- Calculations
- Direct entity manipulation
- Call Service layer

### Repository Example:

```java
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // ✅ GOOD: Query methods only
    
    // Method name query (JPA auto-generates SQL)
    List<Attendance> findByStudentId(Long studentId);
    
    List<Attendance> findByDate(LocalDate date);
    
    boolean existsByStudentIdAndDate(Long studentId, LocalDate date);
    
    // Custom JPQL query
    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId " +
           "AND a.date BETWEEN :startDate AND :endDate")
    List<Attendance> findByStudentAndDateRange(
        @Param("studentId") Long studentId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Native SQL query
    @Query(value = "SELECT COUNT(*) FROM attendance WHERE date = CURDATE()", 
           nativeQuery = true)
    Long countTodayAttendance();
    
    // ❌ BAD: Would be business logic in repository
    // This should be in Service layer
    // default Attendance markAttendance(Student student) { ... }
}
```

---

### ✅ Model Layer - CAN DO:
- Define entity structure with JPA annotations
- Map to database tables
- Define relationships (`@OneToMany`, `@ManyToOne`)
- Basic getters/setters
- Enums for status/types
- Validation annotations (`@NotNull`, `@Size`)

### ❌ Model Layer - CANNOT DO:
- Business logic
- Database operations
- REST handling
- Complex calculations
- Service calls

### Model Example:

```java
@Entity
@Table(name = "attendance")
public class Attendance {
    
    // ✅ GOOD: Entity definition
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationMethod verificationMethod;
    
    private Double confidence;
    
    @Column(columnDefinition = "TEXT")
    private String capturedImage;
    
    @Column(name = "marked_at")
    private LocalDateTime markedAt;
    
    // Enums
    public enum Status {
        PRESENT, ABSENT, LATE
    }
    
    public enum VerificationMethod {
        FACE_RECOGNITION, MANUAL, RFID
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    
    // ... more getters/setters
    
    // ❌ BAD: Would be business logic in model
    // public boolean isMarkedToday() { ... }
    // public void markAsPresent() { ... }
}
```

---

## Configuration Layer

### ✅ Config Layer - CAN DO:
- Spring Security configuration
- JWT token utilities
- CORS setup
- Bean definitions
- Filter chains
- Authentication/Authorization setup

### ❌ Config Layer - CANNOT DO:
- Business logic
- REST handling
- Database operations

### Config Example:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) 
        throws Exception {
        
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        http.addFilterBefore(jwtAuthenticationFilter, 
            UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## Complete Request Flow Example

### Scenario: Student marks attendance via face scan

**1. Client sends request:**
```
POST http://localhost:8080/attendance/mark
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json
Body:
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQ...",
  "studentId": 123
}
```

**2. JwtAuthenticationFilter (Config Layer)**
```java
// Intercepts request
// Validates JWT token
// Extracts username from token
// Loads user details
// Sets SecurityContext authentication
```

**3. AttendanceController (Controller Layer)**
```java
@PostMapping("/mark")
@PreAuthorize("hasRole('STUDENT')")  // Checks role
public ResponseEntity<?> markAttendance(
    @RequestParam String imageData,
    @RequestParam Long studentId
) {
    // Extracts parameters
    // Delegates to service
    Attendance attendance = attendanceService.markAttendance(
        studentId, imageData
    );
    return ResponseEntity.ok(attendance);
}
```

**4. AttendanceService (Service Layer)**
```java
public Attendance markAttendance(Long studentId, String imageData) {
    // Check duplicate (business rule)
    if (isAttendanceMarkedToday(studentId)) {
        throw new IllegalStateException("Already marked");
    }
    
    // Get student from repository
    Student student = studentRepository.findById(studentId)
        .orElseThrow(...);
    
    // Face recognition (another service)
    FaceRecognitionResult result = 
        faceRecognitionService.recognizeFace(imageData);
    
    // Validate confidence (business rule)
    if (result.getConfidence() < 0.7) {
        throw new IllegalArgumentException("Low confidence");
    }
    
    // Create entity
    Attendance attendance = new Attendance();
    attendance.setStudent(student);
    attendance.setStatus(Status.PRESENT);
    attendance.setConfidence(result.getConfidence());
    
    // Save via repository
    return attendanceRepository.save(attendance);
}
```

**5. AttendanceRepository (Repository Layer)**
```java
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // save() inherited from JpaRepository
    boolean existsByStudentIdAndDate(Long studentId, LocalDate date);
}

// JPA executes SQL:
// INSERT INTO attendance (student_id, date, status, confidence, ...) 
// VALUES (123, '2026-04-18', 'PRESENT', 0.95, ...)
```

**6. Attendance (Model Layer)**
```java
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
    // ... mapped to database columns
}
```

**7. Database**
```
attendance table:
+----+------------+------------+---------+------------+
| id | student_id | date       | status  | confidence |
+----+------------+------------+---------+------------+
| 45 | 123        | 2026-04-18 | PRESENT | 0.95       |
+----+------------+------------+---------+------------+
```

**8. Response flows back:**
```
Database → Model → Repository → Service → Controller → Client
```

**9. Client receives response:**
```json
HTTP 200 OK
{
  "id": 45,
  "student": {
    "id": 123,
    "name": "John Doe",
    "rollNumber": "2021001"
  },
  "date": "2026-04-18",
  "status": "PRESENT",
  "confidence": 0.95,
  "markedAt": "2026-04-18T09:15:30"
}
```

---

## Common Violations and Fixes

### ❌ Violation 1: Business Logic in Controller

**WRONG:**
```java
@PostMapping("/mark")
public ResponseEntity<?> markAttendance(...) {
    // BAD: Business logic in controller
    if (attendanceRepository.existsByStudentIdAndDate(studentId, today)) {
        return ResponseEntity.badRequest().body("Already marked");
    }
    Attendance att = new Attendance();
    attendanceRepository.save(att);
    return ResponseEntity.ok(att);
}
```

**CORRECT:**
```java
@PostMapping("/mark")
public ResponseEntity<?> markAttendance(...) {
    // GOOD: Delegate to service
    Attendance att = attendanceService.markAttendance(studentId, imageData);
    return ResponseEntity.ok(att);
}
```

---

### ❌ Violation 2: REST Handling in Service

**WRONG:**
```java
@Service
public class AttendanceService {
    public ResponseEntity<?> markAttendance(...) {  // BAD: ResponseEntity
        // business logic
        return ResponseEntity.ok(attendance);  // BAD: HTTP response
    }
}
```

**CORRECT:**
```java
@Service
public class AttendanceService {
    public Attendance markAttendance(...) {  // GOOD: Return entity
        // business logic
        return attendance;  // GOOD: Return domain object
    }
}
```

---

### ❌ Violation 3: Business Logic in Repository

**WRONG:**
```java
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // BAD: Business logic in repository
    default Attendance markAttendance(Student student) {
        if (existsByStudentIdAndDate(student.getId(), LocalDate.now())) {
            throw new IllegalStateException("Already marked");
        }
        Attendance att = new Attendance();
        att.setStudent(student);
        return save(att);
    }
}
```

**CORRECT:**
```java
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // GOOD: Only query methods
    boolean existsByStudentIdAndDate(Long studentId, LocalDate date);
}

// Move business logic to Service:
@Service
public class AttendanceService {
    public Attendance markAttendance(...) {
        if (attendanceRepository.existsByStudentIdAndDate(...)) {
            throw new IllegalStateException("Already marked");
        }
        // ... rest of logic
    }
}
```

---

### ❌ Violation 4: Service Accessing Request Objects

**WRONG:**
```java
@Service
public class AttendanceService {
    public Attendance markAttendance(HttpServletRequest request) {  // BAD
        String imageData = request.getParameter("imageData");  // BAD
        // ...
    }
}
```

**CORRECT:**
```java
// Controller extracts parameters, passes to service
@PostMapping("/mark")
public ResponseEntity<?> markAttendance(@RequestParam String imageData) {
    return ResponseEntity.ok(
        attendanceService.markAttendance(imageData)
    );
}

// Service receives clean parameters
@Service
public class AttendanceService {
    public Attendance markAttendance(String imageData) {  // GOOD
        // ...
    }
}
```

---

## Verification Checklist

Use this checklist to verify MVC compliance:

### Controller Layer ✓
- [ ] Has `@RestController` annotation
- [ ] Has `@RequestMapping` for base path
- [ ] Methods have `@GetMapping`, `@PostMapping`, etc.
- [ ] Uses `@PreAuthorize` for access control
- [ ] Only extracts parameters and delegates to Service
- [ ] Returns `ResponseEntity<T>`
- [ ] NO business logic (if/else for business rules)
- [ ] NO repository injection
- [ ] NO database operations

### Service Layer ✓
- [ ] Has `@Service` annotation
- [ ] Has `@Transactional` annotation
- [ ] Contains all business logic
- [ ] Validates business rules
- [ ] Injects repositories (not controllers)
- [ ] Returns domain objects (not ResponseEntity)
- [ ] NO REST annotations (@GetMapping, etc.)
- [ ] NO @RequestParam, @PathVariable
- [ ] NO HttpServletRequest/Response

### Repository Layer ✓
- [ ] Has `@Repository` annotation
- [ ] Extends `JpaRepository<Entity, ID>`
- [ ] Only contains query method declarations
- [ ] Uses `@Query` for custom queries only
- [ ] NO business logic
- [ ] NO validation
- [ ] NO entity creation/manipulation

### Model Layer ✓
- [ ] Has `@Entity` annotation
- [ ] Has `@Table` annotation
- [ ] Has `@Id` on primary key
- [ ] Has proper relationships (@ManyToOne, etc.)
- [ ] Has getters/setters only
- [ ] NO business methods
- [ ] NO service calls
- [ ] NO database operations

---

## Summary

| Layer | Purpose | Input | Output |
|-------|---------|-------|--------|
| **Controller** | REST API | HTTP Request | HTTP Response |
| **Service** | Business Logic | Java Objects | Java Objects |
| **Repository** | Data Access | Query Parameters | Entities |
| **Model** | Data Structure | - | Database Mapping |
| **Config** | Setup | - | Beans/Filters |

**Golden Rule**: Each layer should ONLY do its job and delegate to the next layer.

- Controller → Service
- Service → Repository
- Repository → Database (via JPA)

**Never skip layers!** Don't call Repository from Controller directly.

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Easy testing (mock each layer)
- ✅ Maintainability (find code easily)
- ✅ Scalability (modify one layer without affecting others)
- ✅ Team collaboration (different devs work on different layers)
