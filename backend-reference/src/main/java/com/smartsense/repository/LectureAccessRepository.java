package com.smartsense.repository;

import com.smartsense.model.Lecture;
import com.smartsense.model.LectureAccess;
import com.smartsense.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * LectureAccess Repository - Data access layer for LectureAccess entity
 * NO BUSINESS LOGIC - Repository layer only
 */
@Repository
public interface LectureAccessRepository extends JpaRepository<LectureAccess, Long> {

    // Find access records by lecture
    List<LectureAccess> findByLecture(Lecture lecture);

    // Find access records by lecture ID
    List<LectureAccess> findByLectureId(Long lectureId);

    // Find access records by student
    List<LectureAccess> findByStudent(Student student);

    // Find access records by student ID
    List<LectureAccess> findByStudentId(Long studentId);

    // Find completed lectures for a student
    List<LectureAccess> findByStudentAndCompleted(Student student, Boolean completed);

    // Count total accesses for a lecture
    Long countByLectureId(Long lectureId);
}
