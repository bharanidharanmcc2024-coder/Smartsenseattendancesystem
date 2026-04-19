package com.smartsense.service;

import com.smartsense.model.Attendance;
import com.smartsense.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    /**
     * Mark attendance for a student
     */
    public Attendance markAttendance(Long studentId, LocalDate date, Boolean present) {
        Attendance attendance = new Attendance(studentId, date, present);
        return attendanceRepository.save(attendance);
    }

    /**
     * Generate attendance report for a student
     */
    public List<Attendance> generateAttendanceReport(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }
}
