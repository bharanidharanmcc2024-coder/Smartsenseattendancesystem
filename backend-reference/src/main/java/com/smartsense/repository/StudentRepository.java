package com.smartsense.repository;

import com.smartsense.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Student Repository - Data access layer for Student entity
 * Extends JpaRepository for CRUD operations
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Find student by roll number
    Optional<Student> findByRollNumber(String rollNumber);

    // Find student by email
    Optional<Student> findByEmail(String email);

    // Find all students by class name
    List<Student> findByClassName(String className);

    // Check if student exists by roll number
    boolean existsByRollNumber(String rollNumber);

    // Check if student exists by email
    boolean existsByEmail(String email);
}
