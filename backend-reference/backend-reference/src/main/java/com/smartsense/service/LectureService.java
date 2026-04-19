package com.smartsense.service;

import com.smartsense.model.Lecture;
import com.smartsense.model.LectureAccess;
import com.smartsense.model.Student;
import com.smartsense.repository.LectureRepository;
import com.smartsense.repository.LectureAccessRepository;
import com.smartsense.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Lecture Service - Business logic for lecture operations
 * NO REST HANDLING - Service layer only
 * NO DIRECT DATA ACCESS - Uses repository only
 */
@Service
@Transactional
public class LectureService {

    @Autowired
    private LectureRepository lectureRepository;

    @Autowired
    private LectureAccessRepository lectureAccessRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Create a new lecture
     */
    public Lecture createLecture(Lecture lecture) {
        lecture.setUploadDate(LocalDateTime.now());
        return lectureRepository.save(lecture);
    }

    /**
     * Start recording a lecture
     */
    public Lecture startRecording(String title, String subject, String className,
                                 Long teacherId, String teacherName) {
        Lecture lecture = new Lecture();
        lecture.setTitle(title);
        lecture.setSubject(subject);
        lecture.setClassName(className);
        lecture.setTeacherId(teacherId);
        lecture.setTeacherName(teacherName);
        lecture.setDuration(0);
        lecture.setUploadDate(LocalDateTime.now());
        lecture.setLectureDate(LocalDateTime.now());
        lecture.setStatus(Lecture.Status.RECORDING);

        return lectureRepository.save(lecture);
    }

    /**
     * Stop recording and mark as processing
     */
    public Lecture stopRecording(Long lectureId, Integer duration, String recordingUrl) {
        Lecture lecture = lectureRepository.findById(lectureId)
            .orElseThrow(() -> new IllegalArgumentException("Lecture not found"));

        lecture.setDuration(duration);
        lecture.setRecordingUrl(recordingUrl);
        lecture.setStatus(Lecture.Status.AVAILABLE);

        return lectureRepository.save(lecture);
    }

    /**
     * Get all lectures
     */
    public List<Lecture> getAllLectures() {
        return lectureRepository.findAll();
    }

    /**
     * Get lectures by class name
     */
    public List<Lecture> getLecturesByClass(String className) {
        return lectureRepository.findByClassName(className);
    }

    /**
     * Get lectures by teacher
     */
    public List<Lecture> getLecturesByTeacher(Long teacherId) {
        return lectureRepository.findByTeacherId(teacherId);
    }

    /**
     * Get available lectures for a class
     */
    public List<Lecture> getAvailableLectures(String className) {
        return lectureRepository.findByClassNameAndStatus(className, Lecture.Status.AVAILABLE);
    }

    /**
     * Delete lecture
     */
    public void deleteLecture(Long lectureId) {
        lectureRepository.deleteById(lectureId);
    }

    /**
     * Record student access to a lecture
     */
    public LectureAccess recordAccess(Long lectureId, Long studentId) {
        Lecture lecture = lectureRepository.findById(lectureId)
            .orElseThrow(() -> new IllegalArgumentException("Lecture not found"));

        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        LectureAccess access = new LectureAccess();
        access.setLecture(lecture);
        access.setStudent(student);
        access.setStudentName(student.getName());
        access.setAccessDate(LocalDateTime.now());
        access.setWatchDuration(0);
        access.setCompleted(false);

        return lectureAccessRepository.save(access);
    }

    /**
     * Get access logs for a lecture
     */
    public List<LectureAccess> getLectureAccess(Long lectureId) {
        return lectureAccessRepository.findByLectureId(lectureId);
    }

    /**
     * Update lecture access with watch duration
     */
    public LectureAccess updateWatchDuration(Long accessId, Integer duration, Boolean completed) {
        LectureAccess access = lectureAccessRepository.findById(accessId)
            .orElseThrow(() -> new IllegalArgumentException("Access record not found"));

        access.setWatchDuration(duration);
        access.setCompleted(completed);

        return lectureAccessRepository.save(access);
    }
}
