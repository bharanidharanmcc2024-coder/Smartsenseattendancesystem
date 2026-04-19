package com.smartsense.model;

import jakarta.persistence.*;

@Entity
@Table(name = "engagement")
public class Engagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "engagement_score", nullable = false)
    private Integer engagementScore;

    // Constructors
    public Engagement() {
    }

    public Engagement(Long studentId, Integer engagementScore) {
        this.studentId = studentId;
        this.engagementScore = engagementScore;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Integer getEngagementScore() {
        return engagementScore;
    }

    public void setEngagementScore(Integer engagementScore) {
        this.engagementScore = engagementScore;
    }
}
