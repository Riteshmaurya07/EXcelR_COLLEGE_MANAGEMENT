package com.college.cms.repository;

import com.college.cms.entity.AcademicSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademicSessionRepository extends JpaRepository<AcademicSession, Long> {
    Optional<AcademicSession> findByIsCurrentTrue();
    boolean existsBySessionName(String sessionName);
}
