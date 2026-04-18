package com.smartsense.service;

import com.smartsense.model.Engagement;
import com.smartsense.model.Student;
import com.smartsense.repository.EngagementRepository;
import com.smartsense.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Engagement Service - Business logic for engagement operations
 * NO REST HANDLING - Service layer only
 * NO DIRECT DATA ACCESS - Uses repository only
 */
@Service
@Transactional
public class EngagementService {

    @Autowired
    private EngagementRepository engagementRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Record engagement data for a student
     */
    public Engagement recordEngagement(Long studentId, Integer attentionScore,
                                      Integer participationScore, String className) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Validate scores
        if (attentionScore < 0 || attentionScore > 100) {
            throw new IllegalArgumentException("Attention score must be between 0 and 100");
        }
        if (participationScore < 0 || participationScore > 100) {
            throw new IllegalArgumentException("Participation score must be between 0 and 100");
        }

        Engagement engagement = new Engagement();
        engagement.setStudent(student);
        engagement.setDate(LocalDate.now());
        engagement.setAttentionScore(attentionScore);
        engagement.setParticipationScore(participationScore);
        engagement.setClassName(className);
        engagement.setTimestamp(LocalDateTime.now());

        return engagementRepository.save(engagement);
    }

    /**
     * Get engagement records for a student
     */
    public List<Engagement> getEngagementByStudent(Long studentId) {
        return engagementRepository.findByStudentId(studentId);
    }

    /**
     * Get average engagement scores for a student
     */
    public EngagementAverages getAverageEngagement(Long studentId) {
        Double avgAttention = engagementRepository.calculateAverageAttention(studentId);
        Double avgParticipation = engagementRepository.calculateAverageParticipation(studentId);

        return new EngagementAverages(
            avgAttention != null ? avgAttention.intValue() : 0,
            avgParticipation != null ? avgParticipation.intValue() : 0
        );
    }

    /**
     * Get engagement records by class name
     */
    public List<Engagement> getEngagementByClass(String className) {
        return engagementRepository.findByClassName(className);
    }

    /**
     * Find students with low engagement
     */
    public List<Engagement> findLowEngagement(Integer threshold) {
        return engagementRepository.findLowEngagement(threshold);
    }

    /**
     * DTO for average engagement scores
     */
    public static class EngagementAverages {
        private Integer attention;
        private Integer participation;

        public EngagementAverages(Integer attention, Integer participation) {
            this.attention = attention;
            this.participation = participation;
        }

        public Integer getAttention() { return attention; }
        public Integer getParticipation() { return participation; }
    }
}
