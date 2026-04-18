package com.smartsense.controller;

import com.smartsense.model.Attendance;
import com.smartsense.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    /**
     * POST /attendance/mark
     * Mark attendance - accessible by ADMIN and TEACHER only
     */
    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Attendance> markAttendance(
            @RequestParam Long studentId,
            @RequestParam String date,
            @RequestParam Boolean present) {

        LocalDate parsedDate = LocalDate.parse(date);
        Attendance attendance = attendanceService.markAttendance(studentId, parsedDate, present);
        return ResponseEntity.ok(attendance);
    }

    /**
     * GET /attendance/report
     * Get attendance report - accessible by ADMIN and TEACHER only
     */
    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Attendance>> getAttendanceReport(@RequestParam Long studentId) {
        List<Attendance> report = attendanceService.generateAttendanceReport(studentId);
        return ResponseEntity.ok(report);
    }
}
