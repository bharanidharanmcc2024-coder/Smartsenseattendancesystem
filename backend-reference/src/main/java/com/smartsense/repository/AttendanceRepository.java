package com.smartsense.repository;

import com.smartsense.model.Attendance;
import com.smartsense.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Attendance Repository - Data access layer for Attendance entity
 */
@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Find all attendance records for a student
    List<Attendance> findByStudent(Student student);

    // Find all attendance records for a student by ID
    List<Attendance> findByStudentId(Long studentId);

    // Find attendance records by date
    List<Attendance> findByDate(LocalDate date);

    // Find attendance records by class name
    List<Attendance> findByClassName(String className);

    // Find attendance by student and date
    Optional<Attendance> findByStudentAndDate(Student student, LocalDate date);

    // Find attendance records between dates
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);

    // Find attendance records by student and date range
    List<Attendance> findByStudentAndDateBetween(Student student, LocalDate startDate, LocalDate endDate);

    // Custom query: Count present days for a student
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    Long countPresentDaysByStudentId(Long studentId);

    // Custom query: Calculate attendance percentage
    @Query("SELECT (COUNT(a) * 100.0 / (SELECT COUNT(a2) FROM Attendance a2 WHERE a2.student.id = :studentId)) " +
           "FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    Double calculateAttendancePercentage(Long studentId);

    // Find low confidence face recognition entries (potential proxy)
    @Query("SELECT a FROM Attendance a WHERE a.verificationMethod = 'FACE_RECOGNITION' AND a.confidence < :threshold")
    List<Attendance> findLowConfidenceAttendance(Double threshold);
}
