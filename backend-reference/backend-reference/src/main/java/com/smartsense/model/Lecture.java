package com.smartsense.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Lecture Entity - Represents lecture recordings
 * Maps to the 'lectures' table in the database
 */
@Entity
@Table(name = "lectures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(nullable = false, length = 100)
    private String className;

    @Column(nullable = false)
    private Long teacherId;

    @Column(nullable = false, length = 100)
    private String teacherName;

    @Column(length = 500)
    private String recordingUrl;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @Column(nullable = false)
    private LocalDateTime lectureDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    // Enum for lecture status
    public enum Status {
        RECORDING,
        PROCESSING,
        AVAILABLE,
        ARCHIVED
    }
}
