package com.smartsense.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Engagement Entity - Represents student engagement metrics
 * Maps to the 'engagement' table in the database
 */
@Entity
@Table(name = "engagement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Engagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer attentionScore;  // 0-100

    @Column(nullable = false)
    private Integer participationScore;  // 0-100

    @Column(nullable = false)
    private String className;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
