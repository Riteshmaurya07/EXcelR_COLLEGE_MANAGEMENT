package com.college.cms.repository;

import com.college.cms.entity.FacultyCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyCourseRepository extends JpaRepository<FacultyCourse, Long> {
    Optional<FacultyCourse> findByFacultyIdAndCourseId(Long facultyId, Long courseId);
    boolean existsByFacultyIdAndCourseId(Long facultyId, Long courseId);
    List<FacultyCourse> findByFacultyId(Long facultyId);
    List<FacultyCourse> findByCourseId(Long courseId);
}
