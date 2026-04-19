package com.smartsense.service;

import com.smartsense.model.Alert;
import com.smartsense.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard Service - Business logic for dashboard operations
 * NO REST HANDLING - Service layer only
 * NO DIRECT DATA ACCESS - Uses repository only
 */
@Service
@Transactional
public class DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LectureRepository lectureRepository;

    @Autowired
    private EngagementRepository engagementRepository;

    @Autowired
    private AlertRepository alertRepository;

    /**
     * Get dashboard summary statistics
     */
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Count statistics
        summary.put("totalStudents", studentRepository.count());
        summary.put("totalLectures", lectureRepository.count());
        summary.put("totalAttendanceRecords", attendanceRepository.count());
        summary.put("unresolvedAlerts", alertRepository.findByResolved(false).size());

        // Recent activity counts
        summary.put("todayAttendance", attendanceRepository.countTodayAttendance());
        summary.put("thisWeekLectures", lectureRepository.countByUploadDateAfter(
            LocalDateTime.now().minusWeeks(1)
        ));

        // Low engagement count
        summary.put("lowEngagementStudents", engagementRepository.findLowEngagement(60).size());

        return summary;
    }

    /**
     * Get all alerts
     */
    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    /**
     * Get unresolved alerts
     */
    public List<Alert> getUnresolvedAlerts() {
        return alertRepository.findByResolved(false);
    }

    /**
     * Create a new alert
     */
    public Alert createAlert(Alert alert) {
        alert.setCreatedAt(LocalDateTime.now());
        alert.setResolved(false);
        return alertRepository.save(alert);
    }

    /**
     * Resolve an alert
     */
    public Alert resolveAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new IllegalArgumentException("Alert not found"));

        alert.setResolved(true);
        alert.setResolvedAt(LocalDateTime.now());

        return alertRepository.save(alert);
    }

    /**
     * Delete an alert
     */
    public void deleteAlert(Long alertId) {
        alertRepository.deleteById(alertId);
    }
}
