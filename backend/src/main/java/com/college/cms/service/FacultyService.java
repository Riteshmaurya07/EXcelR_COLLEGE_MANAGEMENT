package com.college.cms.service;

import com.college.cms.dto.MarkAttendanceRequest;
import com.college.cms.dto.MarkOwnAttendanceRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface FacultyService {
    Map<String, Object> getFacultyDashboard(String facultyEmail);
    List<Map<String, Object>> getMyCourses(String facultyEmail);
    List<Map<String, Object>> getStudentsInMyCourses(String facultyEmail);
    List<Map<String, Object>> getStudentsForAttendance(String facultyEmail, Long courseId, LocalDate date);
    Map<String, Object> markStudentsAttendance(String facultyEmail, MarkAttendanceRequest request);
    void markOwnAttendance(String facultyEmail, MarkOwnAttendanceRequest request);
    List<Map<String, Object>> getCourseAttendanceReport(String facultyEmail, Long courseId, LocalDate fromDate, LocalDate toDate);
}
