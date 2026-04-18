package com.smartsense.repository;

import com.smartsense.model.Engagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EngagementRepository extends JpaRepository<Engagement, Long> {

    List<Engagement> findByStudentId(Long studentId);
}
