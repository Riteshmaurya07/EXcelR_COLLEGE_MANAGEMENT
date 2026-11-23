package com.college.cms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = "course_code")
})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_name", nullable = false, length = 150)
    private String courseName;

    @Column(name = "course_code", nullable = false, unique = true, length = 50)
    private String courseCode;

    @Column(nullable = false)
    private Integer credits;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudentCourse> studentCourses = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<FacultyCourse> facultyCourses = new ArrayList<>();

    public Course() {}

    public Course(String courseName, String courseCode, Integer credits, String department, Integer semester, String description) {
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.credits = credits;
        this.department = department;
        this.semester = semester;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<StudentCourse> getStudentCourses() { return studentCourses; }
    public void setStudentCourses(List<StudentCourse> studentCourses) { this.studentCourses = studentCourses; }

    public List<FacultyCourse> getFacultyCourses() { return facultyCourses; }
    public void setFacultyCourses(List<FacultyCourse> facultyCourses) { this.facultyCourses = facultyCourses; }
}
