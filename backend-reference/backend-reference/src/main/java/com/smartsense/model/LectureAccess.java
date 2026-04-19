package com.smartsense.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * LectureAccess Entity - Tracks student access to lectures
 * Maps to the 'lecture_access' table in the database
 */
@Entity
@Table(name = "lecture_access")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LectureAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecture_id", nullable = false)
    private Lecture lecture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 100)
    private String studentName;

    @Column(nullable = false)
    private LocalDateTime accessDate;

    @Column(nullable = false)
    private Integer watchDuration; // in minutes

    @Column(nullable = false)
    private Boolean completed = false;
}
