package com.college.cms.service;

import java.util.List;
import java.util.Map;

public interface StudentService {
    Map<String, Object> getStudentDashboard(String studentEmail);
    List<Map<String, Object>> getAllAvailableCourses(String studentEmail);
    List<Map<String, Object>> getMyEnrolledCourses(String studentEmail);
    void enrolInCourse(String studentEmail, Long courseId);
    List<Map<String, Object>> getAttendanceSummary(String studentEmail);
    List<Map<String, Object>> getMonthlyAttendanceDetail(String studentEmail, int year, int month);
    List<Map<String, Object>> getTimetable(String studentEmail);
    List<Map<String, Object>> getMyCourseFaculties(String studentEmail);
}
