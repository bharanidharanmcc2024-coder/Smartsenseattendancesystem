package com.smartsense.repository;

import com.smartsense.model.Engagement;
import com.smartsense.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

/**
 * Engagement Repository - Data access layer for Engagement entity
 * NO BUSINESS LOGIC - Repository layer only
 */
@Repository
public interface EngagementRepository extends JpaRepository<Engagement, Long> {

    // Find all engagement records for a student
    List<Engagement> findByStudent(Student student);

    // Find engagement records by student ID
    List<Engagement> findByStudentId(Long studentId);

    // Find engagement records by date
    List<Engagement> findByDate(LocalDate date);

    // Find engagement records by class name
    List<Engagement> findByClassName(String className);

    // Find engagement records between dates
    List<Engagement> findByDateBetween(LocalDate startDate, LocalDate endDate);

    // Find engagement records by student and date range
    List<Engagement> findByStudentAndDateBetween(Student student, LocalDate startDate, LocalDate endDate);

    // Custom query: Calculate average attention score for a student
    @Query("SELECT AVG(e.attentionScore) FROM Engagement e WHERE e.student.id = :studentId")
    Double calculateAverageAttention(Long studentId);

    // Custom query: Calculate average participation score for a student
    @Query("SELECT AVG(e.participationScore) FROM Engagement e WHERE e.student.id = :studentId")
    Double calculateAverageParticipation(Long studentId);

    // Custom query: Find students with low engagement
    @Query("SELECT e FROM Engagement e WHERE e.attentionScore < :threshold OR e.participationScore < :threshold")
    List<Engagement> findLowEngagement(Integer threshold);
}
