package com.college.cms.controller;

import com.college.cms.dto.MarkAttendanceRequest;
import com.college.cms.dto.MarkOwnAttendanceRequest;
import com.college.cms.service.FacultyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {
        return ResponseEntity.ok(facultyService.getFacultyDashboard(auth.getName()));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getMyCourses(Authentication auth) {
        return ResponseEntity.ok(facultyService.getMyCourses(auth.getName()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents(Authentication auth) {
        return ResponseEntity.ok(facultyService.getStudentsInMyCourses(auth.getName()));
    }

    @GetMapping("/attendance/students")
    public ResponseEntity<List<Map<String, Object>>> getStudentsForAttendance(
            @RequestParam Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        return ResponseEntity.ok(facultyService.getStudentsForAttendance(auth.getName(), courseId, date));
    }

    @PostMapping("/attendance/mark")
    public ResponseEntity<Map<String, Object>> markAttendance(@Valid @RequestBody MarkAttendanceRequest request, Authentication auth) {
        return ResponseEntity.ok(facultyService.markStudentsAttendance(auth.getName(), request));
    }

    @PostMapping("/attendance/mark-own")
    public ResponseEntity<Map<String, String>> markOwnAttendance(@Valid @RequestBody MarkOwnAttendanceRequest request, Authentication auth) {
        facultyService.markOwnAttendance(auth.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Your attendance has been recorded successfully"));
    }

    @GetMapping("/attendance/report")
    public ResponseEntity<List<Map<String, Object>>> getCourseAttendanceReport(
            @RequestParam Long courseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication auth) {
        return ResponseEntity.ok(facultyService.getCourseAttendanceReport(auth.getName(), courseId, fromDate, toDate));
    }
}
