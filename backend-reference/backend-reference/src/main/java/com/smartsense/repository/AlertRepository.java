package com.smartsense.repository;

import com.smartsense.model.Alert;
import com.smartsense.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Alert Repository - Data access layer for Alert entity
 * NO BUSINESS LOGIC - Repository layer only
 */
@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Find all alerts by type
    List<Alert> findByType(Alert.AlertType type);

    // Find all alerts by severity
    List<Alert> findBySeverity(Alert.Severity severity);

    // Find all unresolved alerts
    List<Alert> findByResolved(Boolean resolved);

    // Find alerts for a specific student
    List<Alert> findByStudent(Student student);

    // Find alerts for a student ID
    List<Alert> findByStudentId(Long studentId);

    // Find alerts between timestamps
    List<Alert> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    // Find unresolved alerts ordered by severity
    List<Alert> findByResolvedOrderBySeverityDesc(Boolean resolved);
}
