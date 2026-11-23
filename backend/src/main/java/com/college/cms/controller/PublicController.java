package com.college.cms.controller;

import com.college.cms.repository.CourseRepository;
import com.college.cms.repository.FacultyProfileRepository;
import com.college.cms.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Value("${app.college.name:Sunrise Institute of Technology}")
    private String collegeName;

    // Foundation year configured in application.properties (confirm with college)
    @Value("${app.college.established-year:2010}")
    private Integer establishedYear;

    @GetMapping("/college-info")
    public ResponseEntity<Map<String, Object>> getCollegeInfo() {
        Map<String, Object> map = new HashMap<>();
        map.put("collegeName", collegeName);
        map.put("establishedYear", establishedYear);
        map.put("totalStudents", studentProfileRepository.count());
        map.put("totalFaculty", facultyProfileRepository.count());
        map.put("totalCourses", courseRepository.count());
        return ResponseEntity.ok(map);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPublicStats() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalStudents", studentProfileRepository.count());
        map.put("totalFaculty", facultyProfileRepository.count());
        map.put("totalCourses", courseRepository.count());
        map.put("establishedYear", establishedYear);
        return ResponseEntity.ok(map);
    }
}
