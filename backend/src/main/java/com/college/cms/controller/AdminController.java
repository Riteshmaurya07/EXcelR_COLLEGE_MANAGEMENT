package com.college.cms.controller;

import com.college.cms.dto.*;
import com.college.cms.entity.AcademicSession;
import com.college.cms.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // Students
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<Map<String, Object>> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(adminService.createStudent(request));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<Map<String, Object>> updateStudent(@PathVariable Long id, @Valid @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(adminService.updateStudent(id, request));
    }

    @PatchMapping("/students/{id}/status")
    public ResponseEntity<Map<String, String>> toggleStudentStatus(@PathVariable Long id) {
        adminService.toggleStudentStatus(id);
        return ResponseEntity.ok(Map.of("message", "Student status updated successfully"));
    }

    // Faculties
    @GetMapping("/faculties")
    public ResponseEntity<List<Map<String, Object>>> getFaculties() {
        return ResponseEntity.ok(adminService.getAllFaculties());
    }

    @PostMapping("/faculties")
    public ResponseEntity<Map<String, Object>> createFaculty(@Valid @RequestBody CreateFacultyRequest request) {
        return ResponseEntity.ok(adminService.createFacultyOrAdmin(request));
    }

    @PutMapping("/faculties/{id}")
    public ResponseEntity<Map<String, Object>> updateFaculty(@PathVariable Long id, @Valid @RequestBody UpdateFacultyRequest request) {
        return ResponseEntity.ok(adminService.updateFaculty(id, request));
    }

    @PatchMapping("/faculties/{id}/status")
    public ResponseEntity<Map<String, String>> toggleFacultyStatus(@PathVariable Long id) {
        adminService.toggleFacultyStatus(id);
        return ResponseEntity.ok(Map.of("message", "Faculty status updated successfully"));
    }

    // Courses
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses() {
        return ResponseEntity.ok(adminService.getAllCourses());
    }

    @PostMapping("/courses")
    public ResponseEntity<Map<String, Object>> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        return ResponseEntity.ok(adminService.createCourse(request));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Map<String, Object>> updateCourse(@PathVariable Long id, @Valid @RequestBody UpdateCourseRequest request) {
        return ResponseEntity.ok(adminService.updateCourse(id, request));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Map<String, String>> deleteCourse(@PathVariable Long id) {
        adminService.deleteCourse(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }

    @DeleteMapping("/courses/{id}/faculty/{facultyId}")
    public ResponseEntity<Map<String, String>> unassignFaculty(@PathVariable Long id, @PathVariable Long facultyId) {
        adminService.unassignFaculty(id, facultyId);
        return ResponseEntity.ok(Map.of("message", "Faculty unassigned from course successfully"));
    }

    @PostMapping("/assign-faculty")
    public ResponseEntity<Map<String, String>> assignFaculty(@Valid @RequestBody AssignFacultyRequest request) {
        adminService.assignFaculty(request);
        return ResponseEntity.ok(Map.of("message", "Faculty assigned successfully to course"));
    }

    // Enrolments
    @GetMapping("/enrolments")
    public ResponseEntity<List<Map<String, Object>>> getEnrolments() {
        return ResponseEntity.ok(adminService.getAllEnrolments());
    }

    @PostMapping("/enrol")
    public ResponseEntity<Map<String, String>> enrolStudent(@Valid @RequestBody EnrollmentRequest request) {
        adminService.enrolStudent(request);
        return ResponseEntity.ok(Map.of("message", "Student enrolled successfully"));
    }

    @PostMapping("/drop")
    public ResponseEntity<Map<String, String>> dropStudent(@Valid @RequestBody EnrollmentRequest request) {
        adminService.dropStudent(request);
        return ResponseEntity.ok(Map.of("message", "Student course dropped successfully"));
    }

    // Reports
    @GetMapping("/reports/student")
    public ResponseEntity<List<Map<String, Object>>> getStudentAttendanceReport(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(adminService.getStudentAttendanceReport(courseId, fromDate, toDate));
    }

    @GetMapping("/reports/faculty")
    public ResponseEntity<List<Map<String, Object>>> getFacultyAttendanceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(adminService.getFacultyAttendanceReport(fromDate, toDate));
    }

    // Faculty Attendance by Admin
    @PostMapping("/faculty-attendance/mark")
    public ResponseEntity<Map<String, String>> markFacultyAttendanceByAdmin(@Valid @RequestBody AdminMarkFacultyAttendanceRequest request) {
        adminService.markFacultyAttendanceByAdmin(request);
        return ResponseEntity.ok(Map.of("message", "Faculty attendance marked successfully"));
    }

    // Sessions
    @GetMapping("/sessions")
    public ResponseEntity<List<AcademicSession>> getSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    @PostMapping("/sessions")
    public ResponseEntity<AcademicSession> createSession(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.ok(adminService.createSession(request));
    }

    @PatchMapping("/sessions/{id}/activate")
    public ResponseEntity<AcademicSession> activateSession(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.activateSession(id));
    }

    // Holidays
    @GetMapping("/holidays")
    public ResponseEntity<List<com.college.cms.entity.Holiday>> getHolidays() {
        return ResponseEntity.ok(adminService.getAllHolidays());
    }

    @PostMapping("/holidays")
    public ResponseEntity<com.college.cms.entity.Holiday> createHoliday(@Valid @RequestBody CreateHolidayRequest request) {
        return ResponseEntity.ok(adminService.createHoliday(request));
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<Map<String, String>> deleteHoliday(@PathVariable Long id) {
        adminService.deleteHoliday(id);
        return ResponseEntity.ok(Map.of("message", "Holiday deleted successfully"));
    }
}
