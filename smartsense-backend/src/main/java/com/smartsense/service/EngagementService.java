package com.smartsense.service;

import com.smartsense.model.Engagement;
import com.smartsense.repository.EngagementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EngagementService {

    @Autowired
    private EngagementRepository engagementRepository;

    /**
     * Fetch engagement score for a student
     */
    public List<Engagement> fetchEngagementScore(Long studentId) {
        return engagementRepository.findByStudentId(studentId);
    }
}
