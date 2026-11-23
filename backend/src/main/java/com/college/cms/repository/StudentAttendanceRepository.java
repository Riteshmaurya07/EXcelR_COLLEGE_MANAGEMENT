package com.college.cms.repository;

import com.college.cms.entity.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {
    Optional<StudentAttendance> findByStudentCourseIdAndClassDate(Long studentCourseId, LocalDate classDate);
    boolean existsByStudentCourseIdAndClassDate(Long studentCourseId, LocalDate classDate);

    List<StudentAttendance> findByStudentCourseId(Long studentCourseId);
    List<StudentAttendance> findByClassDate(LocalDate classDate);

    @Query("SELECT sa FROM StudentAttendance sa WHERE sa.studentCourse.id = :studentCourseId AND sa.classDate BETWEEN :startDate AND :endDate ORDER BY sa.classDate ASC")
    List<StudentAttendance> findByStudentCourseIdAndDateRange(@Param("studentCourseId") Long studentCourseId, 
                                                            @Param("startDate") LocalDate startDate, 
                                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT sa FROM StudentAttendance sa WHERE sa.studentCourse.course.id = :courseId AND sa.classDate BETWEEN :startDate AND :endDate ORDER BY sa.classDate ASC")
    List<StudentAttendance> findByCourseIdAndDateRange(@Param("courseId") Long courseId, 
                                                     @Param("startDate") LocalDate startDate, 
                                                     @Param("endDate") LocalDate endDate);

    @Query("SELECT sa FROM StudentAttendance sa WHERE sa.studentCourse.student.id = :studentId ORDER BY sa.classDate ASC")
    List<StudentAttendance> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT sa FROM StudentAttendance sa WHERE sa.classDate = :date")
    List<StudentAttendance> findByDate(@Param("date") LocalDate date);
}
