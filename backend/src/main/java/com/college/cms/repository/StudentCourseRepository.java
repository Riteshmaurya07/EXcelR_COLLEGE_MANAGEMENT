package com.college.cms.repository;

import com.college.cms.entity.EnrollmentStatus;
import com.college.cms.entity.StudentCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentCourseRepository extends JpaRepository<StudentCourse, Long> {
    Optional<StudentCourse> findByStudentIdAndCourseId(Long studentId, Long courseId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    List<StudentCourse> findByStudentId(Long studentId);
    List<StudentCourse> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
    List<StudentCourse> findByCourseId(Long courseId);
    List<StudentCourse> findByCourseIdAndStatus(Long courseId, EnrollmentStatus status);
    
    @Query("SELECT COUNT(sc) FROM StudentCourse sc WHERE sc.course.id = :courseId AND sc.status = 'ENROLLED'")
    long countEnrolledStudentsInCourse(@Param("courseId") Long courseId);
}
