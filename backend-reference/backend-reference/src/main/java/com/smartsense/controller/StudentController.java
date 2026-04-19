package com.smartsense.controller;

import com.smartsense.model.Student;
import com.smartsense.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Student Controller - REST API endpoints for student operations
 * Implements MVC Controller Layer
 */
@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "*")  // Configure CORS for frontend access
public class StudentController {

    @Autowired
    private StudentService studentService;

    /**
     * GET /students/get
     * Get all students
     * Accessible by: ADMIN, TEACHER
     */
    @GetMapping("/get")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    /**
     * GET /students/get/{id}
     * Get student by ID
     * Accessible by: ADMIN, TEACHER, STUDENT (own record)
     */
    @GetMapping("/get/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /students/class/{className}
     * Get students by class name
     * Accessible by: ADMIN, TEACHER
     */
    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudentsByClass(@PathVariable String className) {
        List<Student> students = studentService.getStudentsByClassName(className);
        return ResponseEntity.ok(students);
    }

    /**
     * POST /students/add
     * Add new student
     * Accessible by: ADMIN only
     */
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        try {
            Student newStudent = studentService.addStudent(student);
            return ResponseEntity.status(HttpStatus.CREATED).body(newStudent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PUT /students/update/{id}
     * Update student information
     * Accessible by: ADMIN only
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Student> updateStudent(
        @PathVariable Long id,
        @RequestBody Student studentDetails
    ) {
        try {
            Student updatedStudent = studentService.updateStudent(id, studentDetails);
            return ResponseEntity.ok(updatedStudent);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /students/delete/{id}
     * Delete student
     * Accessible by: ADMIN only
     */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /students/{id}/enroll-face
     * Enroll face data for student
     * Accessible by: ADMIN, TEACHER
     */
    @PostMapping("/{id}/enroll-face")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Student> enrollFaceData(
        @PathVariable Long id,
        @RequestBody String faceData
    ) {
        try {
            Student student = studentService.enrollFaceData(id, faceData);
            return ResponseEntity.ok(student);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
