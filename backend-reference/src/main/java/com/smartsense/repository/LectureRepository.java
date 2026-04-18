package com.smartsense.repository;

import com.smartsense.model.Lecture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Lecture Repository - Data access layer for Lecture entity
 * NO BUSINESS LOGIC - Repository layer only
 */
@Repository
public interface LectureRepository extends JpaRepository<Lecture, Long> {

    // Find lectures by class name
    List<Lecture> findByClassName(String className);

    // Find lectures by teacher ID
    List<Lecture> findByTeacherId(Long teacherId);

    // Find lectures by status
    List<Lecture> findByStatus(Lecture.Status status);

    // Find lectures by subject
    List<Lecture> findBySubject(String subject);

    // Find lectures by class name and status
    List<Lecture> findByClassNameAndStatus(String className, Lecture.Status status);
}
