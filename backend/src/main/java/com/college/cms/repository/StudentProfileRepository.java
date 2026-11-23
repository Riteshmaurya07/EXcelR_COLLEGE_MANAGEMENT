package com.college.cms.repository;

import com.college.cms.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByRollNo(String rollNo);
    boolean existsByRollNo(String rollNo);
    Optional<StudentProfile> findByUserId(Long userId);
    List<StudentProfile> findByDepartment(String department);
    
    @Query("SELECT s.department, COUNT(s) FROM StudentProfile s GROUP BY s.department")
    List<Object[]> countStudentsByDepartment();
}
