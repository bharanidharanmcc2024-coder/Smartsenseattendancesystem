package com.smartsense.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Attendance Entity - Represents attendance records
 * Maps to the 'attendance' table in the database
 */
@Entity
@Table(name = "attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String className;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationMethod verificationMethod;

    private Double confidence;  // Face recognition confidence score (0.0 to 1.0)

    // Enum for attendance status
    public enum Status {
        PRESENT,
        ABSENT,
        LATE
    }

    // Enum for verification method
    public enum VerificationMethod {
        FACE_RECOGNITION,
        MANUAL
    }

    // Composite unique constraint: one attendance record per student per date
    @Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "date"})
    })
    public static class AttendanceConstraints {}
}
