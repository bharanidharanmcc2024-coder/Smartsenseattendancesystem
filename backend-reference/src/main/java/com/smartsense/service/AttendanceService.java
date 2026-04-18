package com.smartsense.service;

import com.smartsense.model.Attendance;
import com.smartsense.model.Student;
import com.smartsense.repository.AttendanceRepository;
import com.smartsense.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Attendance Service - Business logic for attendance operations
 */
@Service
@Transactional
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Mark attendance for a student
     *
     * @param studentId Student ID
     * @param status Attendance status (PRESENT, ABSENT, LATE)
     * @param method Verification method (FACE_RECOGNITION, MANUAL)
     * @param confidence Face recognition confidence (0.0 to 1.0)
     * @param capturedImage Base64 encoded captured image
     * @return Created attendance record
     */
    public Attendance markAttendance(
        Long studentId,
        Attendance.Status status,
        Attendance.VerificationMethod method,
        Double confidence,
        String capturedImage
    ) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        LocalDate today = LocalDate.now();

        // Check if already marked today
        Optional<Attendance> existing = attendanceRepository
            .findByStudentAndDate(student, today);

        if (existing.isPresent()) {
            throw new IllegalStateException("Attendance already marked for today");
        }

        // Create new attendance record
        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setDate(today);
        attendance.setStatus(status);
        attendance.setTimestamp(LocalDateTime.now());
        attendance.setClassName(student.getClassName());
        attendance.setVerificationMethod(method);
        attendance.setConfidence(confidence);

        // Store captured image (in production, store in cloud storage like S3)
        if (capturedImage != null && method == Attendance.VerificationMethod.FACE_RECOGNITION) {
            // In production, upload to cloud storage and store URL
            // attendance.setCapturedImageUrl(uploadToS3(capturedImage));
            // For demo, we'll just note that it was captured
        }

        return attendanceRepository.save(attendance);
    }

    /**
     * Check if attendance is already marked today
     */
    public boolean isAttendanceMarkedToday(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        LocalDate today = LocalDate.now();
        return attendanceRepository.findByStudentAndDate(student, today).isPresent();
    }

    /**
     * Get attendance records for a student
     */
    public List<Attendance> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    /**
     * Get attendance for a specific date
     */
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    /**
     * Get today's attendance
     */
    public List<Attendance> getTodayAttendance() {
        return getAttendanceByDate(LocalDate.now());
    }

    /**
     * Get attendance between dates
     */
    public List<Attendance> getAttendanceBetweenDates(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByDateBetween(startDate, endDate);
    }

    /**
     * Generate attendance report
     */
    public List<AttendanceReport> generateReport(LocalDate startDate, LocalDate endDate) {
        List<Student> students = studentRepository.findAll();
        List<AttendanceReport> reports = new java.util.ArrayList<>();

        for (Student student : students) {
            List<Attendance> attendance;

            if (startDate != null && endDate != null) {
                attendance = attendanceRepository.findByStudentAndDateBetween(
                    student, startDate, endDate
                );
            } else {
                attendance = attendanceRepository.findByStudent(student);
            }

            long totalDays = attendance.size();
            long presentDays = attendance.stream()
                .filter(a -> a.getStatus() == Attendance.Status.PRESENT)
                .count();
            long absentDays = attendance.stream()
                .filter(a -> a.getStatus() == Attendance.Status.ABSENT)
                .count();
            long lateDays = attendance.stream()
                .filter(a -> a.getStatus() == Attendance.Status.LATE)
                .count();

            double percentage = totalDays > 0
                ? (presentDays * 100.0 / totalDays)
                : 0.0;

            AttendanceReport report = new AttendanceReport(
                student.getId(),
                student.getName(),
                student.getRollNumber(),
                student.getClassName(),
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                percentage
            );

            reports.add(report);
        }

        return reports;
    }

    /**
     * Attendance Report DTO
     */
    public static class AttendanceReport {
        private Long studentId;
        private String studentName;
        private String rollNumber;
        private String className;
        private long totalDays;
        private long presentDays;
        private long absentDays;
        private long lateDays;
        private double percentage;

        public AttendanceReport(Long studentId, String studentName, String rollNumber,
                              String className, long totalDays, long presentDays,
                              long absentDays, long lateDays, double percentage) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.rollNumber = rollNumber;
            this.className = className;
            this.totalDays = totalDays;
            this.presentDays = presentDays;
            this.absentDays = absentDays;
            this.lateDays = lateDays;
            this.percentage = percentage;
        }

        // Getters and setters
        public Long getStudentId() { return studentId; }
        public String getStudentName() { return studentName; }
        public String getRollNumber() { return rollNumber; }
        public String getClassName() { return className; }
        public long getTotalDays() { return totalDays; }
        public long getPresentDays() { return presentDays; }
        public long getAbsentDays() { return absentDays; }
        public long getLateDays() { return lateDays; }
        public double getPercentage() { return percentage; }
    }
}
