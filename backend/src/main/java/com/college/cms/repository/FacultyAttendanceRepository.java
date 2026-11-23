package com.college.cms.repository;

import com.college.cms.entity.FacultyAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyAttendanceRepository extends JpaRepository<FacultyAttendance, Long> {
    Optional<FacultyAttendance> findByFacultyIdAndAttendanceDate(Long facultyId, LocalDate attendanceDate);
    boolean existsByFacultyIdAndAttendanceDate(Long facultyId, LocalDate attendanceDate);

    List<FacultyAttendance> findByFacultyId(Long facultyId);

    @Query("SELECT fa FROM FacultyAttendance fa WHERE fa.faculty.id = :facultyId AND fa.attendanceDate BETWEEN :startDate AND :endDate ORDER BY fa.attendanceDate ASC")
    List<FacultyAttendance> findByFacultyIdAndDateRange(@Param("facultyId") Long facultyId, 
                                                       @Param("startDate") LocalDate startDate, 
                                                       @Param("endDate") LocalDate endDate);

    @Query("SELECT fa FROM FacultyAttendance fa WHERE fa.attendanceDate BETWEEN :startDate AND :endDate ORDER BY fa.attendanceDate ASC")
    List<FacultyAttendance> findByDateRange(@Param("startDate") LocalDate startDate, 
                                          @Param("endDate") LocalDate endDate);

    @Query("SELECT fa FROM FacultyAttendance fa WHERE fa.attendanceDate = :date")
    List<FacultyAttendance> findByDate(@Param("date") LocalDate date);
}
