package com.smartsense.service;

import com.smartsense.model.Student;
import com.smartsense.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Add a new student
     */
    public Student addStudent(Student student) {
        return studentRepository.save(student);
    }

    /**
     * Fetch all students
     */
    public List<Student> fetchStudents() {
        return studentRepository.findAll();
    }
}
