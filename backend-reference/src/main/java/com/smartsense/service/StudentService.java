package com.smartsense.service;

import com.smartsense.model.Student;
import com.smartsense.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * Student Service - Business logic for student operations
 * Implements MVC Service Layer
 */
@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Get all students
     */
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    /**
     * Get student by ID
     */
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    /**
     * Get student by roll number
     */
    public Optional<Student> getStudentByRollNumber(String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber);
    }

    /**
     * Get students by class name
     */
    public List<Student> getStudentsByClassName(String className) {
        return studentRepository.findByClassName(className);
    }

    /**
     * Add new student
     */
    public Student addStudent(Student student) {
        // Validate that roll number and email are unique
        if (studentRepository.existsByRollNumber(student.getRollNumber())) {
            throw new IllegalArgumentException("Roll number already exists");
        }
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        return studentRepository.save(student);
    }

    /**
     * Update student information
     */
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + id));

        student.setName(studentDetails.getName());
        student.setClassName(studentDetails.getClassName());
        student.setEmail(studentDetails.getEmail());
        student.setPhone(studentDetails.getPhone());

        if (studentDetails.getFaceData() != null) {
            student.setFaceData(studentDetails.getFaceData());
        }

        return studentRepository.save(student);
    }

    /**
     * Delete student
     */
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new IllegalArgumentException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    /**
     * Enroll face data for student
     */
    public Student enrollFaceData(Long id, String faceData) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + id));

        student.setFaceData(faceData);
        return studentRepository.save(student);
    }
}
