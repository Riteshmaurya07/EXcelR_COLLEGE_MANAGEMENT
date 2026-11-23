package com.college.cms.controller;

import com.college.cms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {
        return ResponseEntity.ok(studentService.getStudentDashboard(auth.getName()));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getAvailableCourses(Authentication auth) {
        return ResponseEntity.ok(studentService.getAllAvailableCourses(auth.getName()));
    }

    @GetMapping("/my-courses")
    public ResponseEntity<List<Map<String, Object>>> getMyCourses(Authentication auth) {
        return ResponseEntity.ok(studentService.getMyEnrolledCourses(auth.getName()));
    }

    @PostMapping("/courses/{id}/enrol")
    public ResponseEntity<Map<String, String>> enrolCourse(@PathVariable Long id, Authentication auth) {
        studentService.enrolInCourse(auth.getName(), id);
        return ResponseEntity.ok(Map.of("message", "Enrolled in course successfully"));
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getAttendance(Authentication auth) {
        return ResponseEntity.ok(studentService.getAttendanceSummary(auth.getName()));
    }

    @GetMapping("/attendance/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyAttendance(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Authentication auth) {
        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();
        return ResponseEntity.ok(studentService.getMonthlyAttendanceDetail(auth.getName(), year, month));
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Map<String, Object>>> getTimetable(Authentication auth) {
        return ResponseEntity.ok(studentService.getTimetable(auth.getName()));
    }

    @GetMapping("/faculties")
    public ResponseEntity<List<Map<String, Object>>> getFaculties(Authentication auth) {
        return ResponseEntity.ok(studentService.getMyCourseFaculties(auth.getName()));
    }
}
