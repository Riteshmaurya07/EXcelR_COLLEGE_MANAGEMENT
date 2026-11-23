package com.college.cms.repository;

import com.college.cms.entity.FacultyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {
    Optional<FacultyProfile> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
    Optional<FacultyProfile> findByUserId(Long userId);
    List<FacultyProfile> findByDepartment(String department);
}
