package com.college.cms.service;

import com.college.cms.dto.*;
import com.college.cms.entity.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();

    // Students
    List<Map<String, Object>> getAllStudents();
    Map<String, Object> createStudent(CreateStudentRequest request);
    Map<String, Object> updateStudent(Long id, UpdateStudentRequest request);
    void toggleStudentStatus(Long id);

    // Faculties & Admins
    List<Map<String, Object>> getAllFaculties();
    Map<String, Object> createFacultyOrAdmin(CreateFacultyRequest request);
    Map<String, Object> updateFaculty(Long id, UpdateFacultyRequest request);
    void toggleFacultyStatus(Long id);

    // Courses & Assignment
    List<Map<String, Object>> getAllCourses();
    Map<String, Object> createCourse(CreateCourseRequest request);
    Map<String, Object> updateCourse(Long id, UpdateCourseRequest request);
    void deleteCourse(Long id);
    void assignFaculty(AssignFacultyRequest request);
    void unassignFaculty(Long courseId, Long facultyId);

    // Holidays
    List<Holiday> getAllHolidays();
    Holiday createHoliday(CreateHolidayRequest request);
    void deleteHoliday(Long id);

    // Enrolments
    List<Map<String, Object>> getAllEnrolments();
    void enrolStudent(EnrollmentRequest request);
    void dropStudent(EnrollmentRequest request);

    // Reports
    List<Map<String, Object>> getStudentAttendanceReport(Long courseId, LocalDate fromDate, LocalDate toDate);
    List<Map<String, Object>> getFacultyAttendanceReport(LocalDate fromDate, LocalDate toDate);
    void markFacultyAttendanceByAdmin(AdminMarkFacultyAttendanceRequest request);

    // Sessions
    List<AcademicSession> getAllSessions();
    AcademicSession createSession(CreateSessionRequest request);
    AcademicSession activateSession(Long sessionId);
}
