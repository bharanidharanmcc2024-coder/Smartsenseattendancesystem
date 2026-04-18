package com.smartsense.controller;

import com.smartsense.model.Engagement;
import com.smartsense.service.EngagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Engagement Controller - REST API endpoints for engagement operations
 * NO BUSINESS LOGIC - Controller layer only
 * Delegates to EngagementService for all business logic
 */
@RestController
@RequestMapping("/engagement")
@CrossOrigin(origins = "*")
public class EngagementController {

    @Autowired
    private EngagementService engagementService;

    /**
     * POST /engagement/record
     * Record engagement data for a student
     * Accessible by: TEACHER, ADMIN
     */
    @PostMapping("/record")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Engagement> recordEngagement(
        @RequestParam Long studentId,
        @RequestParam Integer attentionScore,
        @RequestParam Integer participationScore,
        @RequestParam String className
    ) {
        Engagement engagement = engagementService.recordEngagement(
            studentId, attentionScore, participationScore, className
        );
        return ResponseEntity.ok(engagement);
    }

    /**
     * GET /engagement/student/{studentId}
     * Get engagement records for a student
     * Accessible by: STUDENT (own), TEACHER, ADMIN
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<Engagement>> getStudentEngagement(
        @PathVariable Long studentId
    ) {
        List<Engagement> engagement = engagementService.getEngagementByStudent(studentId);
        return ResponseEntity.ok(engagement);
    }

    /**
     * GET /engagement/student/{studentId}/average
     * Get average engagement scores for a student
     * Accessible by: STUDENT (own), TEACHER, ADMIN
     */
    @GetMapping("/student/{studentId}/average")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<EngagementService.EngagementAverages> getAverageEngagement(
        @PathVariable Long studentId
    ) {
        EngagementService.EngagementAverages averages =
            engagementService.getAverageEngagement(studentId);
        return ResponseEntity.ok(averages);
    }

    /**
     * GET /engagement/class/{className}
     * Get engagement records for a class
     * Accessible by: TEACHER, ADMIN
     */
    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Engagement>> getClassEngagement(
        @PathVariable String className
    ) {
        List<Engagement> engagement = engagementService.getEngagementByClass(className);
        return ResponseEntity.ok(engagement);
    }

    /**
     * GET /engagement/low
     * Find students with low engagement
     * Accessible by: TEACHER, ADMIN
     */
    @GetMapping("/low")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Engagement>> getLowEngagement(
        @RequestParam(defaultValue = "60") Integer threshold
    ) {
        List<Engagement> lowEngagement = engagementService.findLowEngagement(threshold);
        return ResponseEntity.ok(lowEngagement);
    }
}
