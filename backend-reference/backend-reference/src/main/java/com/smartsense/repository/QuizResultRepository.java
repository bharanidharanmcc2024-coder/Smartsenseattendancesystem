package com.smartsense.repository;

import com.smartsense.model.QuizResult;
import com.smartsense.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * QuizResult Repository - Data access layer for QuizResult entity
 * NO BUSINESS LOGIC - Repository layer only
 */
@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    // Find quiz results by student
    List<QuizResult> findByStudent(Student student);

    // Find quiz results by student ID
    List<QuizResult> findByStudentId(Long studentId);

    // Find quiz results by subject
    List<QuizResult> findBySubject(String subject);

    // Find quiz results by class name
    List<QuizResult> findByClassName(String className);

    // Custom query: Calculate average percentage for a student
    @Query("SELECT AVG(q.percentage) FROM QuizResult q WHERE q.student.id = :studentId")
    Double calculateAveragePercentage(Long studentId);
}
