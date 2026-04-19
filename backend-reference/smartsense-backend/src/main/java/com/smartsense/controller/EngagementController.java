package com.smartsense.controller;

import com.smartsense.model.Engagement;
import com.smartsense.service.EngagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/engagement")
public class EngagementController {

    @Autowired
    private EngagementService engagementService;

    /**
     * GET /engagement/get
     * Get engagement score - accessible by ADMIN and TEACHER only
     */
    @GetMapping("/get")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Engagement>> getEngagement(@RequestParam Long studentId) {
        List<Engagement> engagements = engagementService.fetchEngagementScore(studentId);
        return ResponseEntity.ok(engagements);
    }
}
