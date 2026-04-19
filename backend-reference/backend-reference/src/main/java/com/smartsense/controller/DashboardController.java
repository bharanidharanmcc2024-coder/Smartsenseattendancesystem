package com.smartsense.controller;

import com.smartsense.model.Alert;
import com.smartsense.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Dashboard Controller - REST API endpoints for dashboard operations
 * NO BUSINESS LOGIC - Controller layer only
 * Delegates to DashboardService for all business logic
 */
@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * GET /dashboard/summary
     * Get dashboard summary statistics
     * Accessible by: ADMIN, TEACHER
     */
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> summary = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * GET /dashboard/alerts
     * Get all alerts
     * Accessible by: ADMIN, TEACHER
     */
    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        List<Alert> alerts = dashboardService.getAllAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * GET /dashboard/alerts/unresolved
     * Get unresolved alerts
     * Accessible by: ADMIN, TEACHER
     */
    @GetMapping("/alerts/unresolved")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Alert>> getUnresolvedAlerts() {
        List<Alert> alerts = dashboardService.getUnresolvedAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * POST /dashboard/alert
     * Create a new alert
     * Accessible by: ADMIN, TEACHER
     */
    @PostMapping("/alert")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        Alert created = dashboardService.createAlert(alert);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /dashboard/alert/{id}/resolve
     * Resolve an alert
     * Accessible by: ADMIN, TEACHER
     */
    @PutMapping("/alert/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Alert> resolveAlert(@PathVariable Long id) {
        Alert resolved = dashboardService.resolveAlert(id);
        return ResponseEntity.ok(resolved);
    }

    /**
     * DELETE /dashboard/alert/{id}
     * Delete an alert
     * Accessible by: ADMIN
     */
    @DeleteMapping("/alert/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        dashboardService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}
