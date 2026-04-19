package com.smartsense.controller;

import com.smartsense.model.Lecture;
import com.smartsense.model.LectureAccess;
import com.smartsense.service.LectureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Lecture Controller - REST API endpoints for lecture operations
 * NO BUSINESS LOGIC - Controller layer only
 * Delegates to LectureService for all business logic
 */
@RestController
@RequestMapping("/lectures")
@CrossOrigin(origins = "*")
public class LectureController {

    @Autowired
    private LectureService lectureService;

    /**
     * POST /lectures/create
     * Create a new lecture
     * Accessible by: TEACHER
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Lecture> createLecture(@RequestBody Lecture lecture) {
        Lecture created = lectureService.createLecture(lecture);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * POST /lectures/start-recording
     * Start recording a lecture
     * Accessible by: TEACHER
     */
    @PostMapping("/start-recording")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Lecture> startRecording(
        @RequestParam String title,
        @RequestParam String subject,
        @RequestParam String className,
        @RequestParam Long teacherId,
        @RequestParam String teacherName
    ) {
        Lecture lecture = lectureService.startRecording(
            title, subject, className, teacherId, teacherName
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(lecture);
    }

    /**
     * POST /lectures/{id}/stop-recording
     * Stop recording a lecture
     * Accessible by: TEACHER
     */
    @PostMapping("/{id}/stop-recording")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Lecture> stopRecording(
        @PathVariable Long id,
        @RequestParam Integer duration,
        @RequestParam String recordingUrl
    ) {
        Lecture lecture = lectureService.stopRecording(id, duration, recordingUrl);
        return ResponseEntity.ok(lecture);
    }

    /**
     * GET /lectures/all
     * Get all lectures
     * Accessible by: ADMIN, TEACHER
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Lecture>> getAllLectures() {
        List<Lecture> lectures = lectureService.getAllLectures();
        return ResponseEntity.ok(lectures);
    }

    /**
     * GET /lectures/class/{className}
     * Get lectures for a class
     * Accessible by: STUDENT (own class), TEACHER, ADMIN
     */
    @GetMapping("/class/{className}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<Lecture>> getLecturesByClass(
        @PathVariable String className
    ) {
        List<Lecture> lectures = lectureService.getLecturesByClass(className);
        return ResponseEntity.ok(lectures);
    }

    /**
     * GET /lectures/teacher/{teacherId}
     * Get lectures by teacher
     * Accessible by: TEACHER (own), ADMIN
     */
    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<Lecture>> getLecturesByTeacher(
        @PathVariable Long teacherId
    ) {
        List<Lecture> lectures = lectureService.getLecturesByTeacher(teacherId);
        return ResponseEntity.ok(lectures);
    }

    /**
     * DELETE /lectures/{id}
     * Delete a lecture
     * Accessible by: TEACHER (own), ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Void> deleteLecture(@PathVariable Long id) {
        lectureService.deleteLecture(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /lectures/{id}/record-access
     * Record student access to a lecture
     * Accessible by: STUDENT
     */
    @PostMapping("/{id}/record-access")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<LectureAccess> recordAccess(
        @PathVariable Long id,
        @RequestParam Long studentId
    ) {
        LectureAccess access = lectureService.recordAccess(id, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(access);
    }

    /**
     * GET /lectures/{id}/access
     * Get access logs for a lecture
     * Accessible by: TEACHER, ADMIN
     */
    @GetMapping("/{id}/access")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<LectureAccess>> getLectureAccess(
        @PathVariable Long id
    ) {
        List<LectureAccess> access = lectureService.getLectureAccess(id);
        return ResponseEntity.ok(access);
    }
}
