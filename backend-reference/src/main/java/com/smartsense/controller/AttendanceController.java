package com.smartsense.controller;

import com.smartsense.model.Attendance;
import com.smartsense.service.AttendanceService;
import com.smartsense.service.FaceRecognitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Attendance Controller - REST API endpoints for attendance operations
 * Implements face recognition-based attendance marking
 */
@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private FaceRecognitionService faceRecognitionService;

    /**
     * POST /attendance/mark
     * Mark attendance using face recognition
     * Accessible by: STUDENT (own attendance)
     *
     * Request body should contain:
     * - imageData: Base64 encoded image or multipart file
     * - studentId: ID of the student (from JWT token)
     *
     * Process:
     * 1. Receive captured image
     * 2. Perform liveness detection
     * 3. Perform face recognition
     * 4. Verify identity matches logged-in student
     * 5. Mark attendance if all checks pass
     */
    @PostMapping("/mark")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> markAttendance(
        @RequestParam("imageData") String imageData,
        @RequestParam("studentId") Long studentId
    ) {
        try {
            // Step 1: Liveness detection (anti-spoofing)
            FaceRecognitionService.LivenessResult liveness =
                faceRecognitionService.detectLiveness(imageData);

            if (!liveness.isLive()) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                        "success", false,
                        "error", "Liveness check failed",
                        "message", "Please ensure you are physically present. Photos/videos not accepted."
                    ));
            }

            // Step 2: Face recognition
            FaceRecognitionService.RecognitionResult recognition =
                faceRecognitionService.recognizeFace(imageData);

            if (recognition.getStudent() == null) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "success", false,
                        "error", "Face not recognized",
                        "message", "Please ensure proper lighting and face the camera directly."
                    ));
            }

            // Step 3: Verify identity matches logged-in student
            if (!recognition.getStudent().getId().equals(studentId)) {
                return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                        "success", false,
                        "error", "Identity mismatch",
                        "message", "Detected face does not match logged-in student."
                    ));
            }

            // Step 4: Check if already marked today
            if (attendanceService.isAttendanceMarkedToday(studentId)) {
                return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                        "success", false,
                        "error", "Already marked",
                        "message", "Attendance already marked for today."
                    ));
            }

            // Step 5: Mark attendance
            Attendance attendance = attendanceService.markAttendance(
                studentId,
                Attendance.Status.PRESENT,
                Attendance.VerificationMethod.FACE_RECOGNITION,
                recognition.getConfidence(),
                imageData // Store captured image for records
            );

            // Success response
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Attendance marked successfully",
                "attendance", attendance,
                "confidence", recognition.getConfidence(),
                "livenessScore", liveness.getScore()
            ));

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "error", "Processing error",
                    "message", e.getMessage()
                ));
        }
    }

    /**
     * POST /attendance/mark-manual
     * Manual attendance marking (for admin/teacher override)
     * Accessible by: ADMIN, TEACHER
     */
    @PostMapping("/mark-manual")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Attendance> markAttendanceManual(
        @RequestParam Long studentId,
        @RequestParam Attendance.Status status
    ) {
        Attendance attendance = attendanceService.markAttendance(
            studentId,
            status,
            Attendance.VerificationMethod.MANUAL,
            null,
            null
        );
        return ResponseEntity.ok(attendance);
    }

    /**
     * GET /attendance/student/{studentId}
     * Get attendance records for a student
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<Attendance>> getStudentAttendance(
        @PathVariable Long studentId
    ) {
        List<Attendance> attendance = attendanceService.getAttendanceByStudent(studentId);
        return ResponseEntity.ok(attendance);
    }

    /**
     * GET /attendance/date/{date}
     * Get attendance for a specific date
     */
    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceByDate(
        @PathVariable String date
    ) {
        LocalDate localDate = LocalDate.parse(date);
        List<Attendance> attendance = attendanceService.getAttendanceByDate(localDate);
        return ResponseEntity.ok(attendance);
    }

    /**
     * GET /attendance/today
     * Get today's attendance
     */
    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getTodayAttendance() {
        List<Attendance> attendance = attendanceService.getTodayAttendance();
        return ResponseEntity.ok(attendance);
    }

    /**
     * GET /attendance/report
     * Generate attendance report
     */
    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> generateReport(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate
    ) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : null;

        var report = attendanceService.generateReport(start, end);
        return ResponseEntity.ok(report);
    }
}

/*
 * EXAMPLE API CALLS:
 *
 * Mark Attendance (Student):
 * POST /attendance/mark
 * Content-Type: application/json
 * {
 *   "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
 *   "studentId": 1
 * }
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "message": "Attendance marked successfully",
 *   "attendance": { ... },
 *   "confidence": 0.95,
 *   "livenessScore": 0.92
 * }
 *
 * Response (Failure - Liveness):
 * {
 *   "success": false,
 *   "error": "Liveness check failed",
 *   "message": "Please ensure you are physically present..."
 * }
 */
