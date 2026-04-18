package com.smartsense.controller;

import com.smartsense.model.Student;
import com.smartsense.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /**
     * POST /students/add
     * Add student - accessible by ADMIN and TEACHER only
     */
    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        Student savedStudent = studentService.addStudent(student);
        return ResponseEntity.ok(savedStudent);
    }

    /**
     * GET /students/get
     * Get all students - accessible by ADMIN and TEACHER only
     */
    @GetMapping("/get")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Student>> getStudents() {
        List<Student> students = studentService.fetchStudents();
        return ResponseEntity.ok(students);
    }
}
