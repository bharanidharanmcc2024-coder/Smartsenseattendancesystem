package com.smartsense.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Alert Entity - Represents system alerts and notifications
 * Maps to the 'alerts' table in the database
 */
@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType type;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;  // Optional - null for system-wide alerts

    @Column(nullable = false)
    private Boolean resolved = false;

    // Enum for alert types
    public enum AlertType {
        LOW_ATTENDANCE,
        LOW_ENGAGEMENT,
        PROXY_DETECTED,
        SYSTEM
    }

    // Enum for severity levels
    public enum Severity {
        INFO,
        WARNING,
        CRITICAL
    }
}
