package com.college.cms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "faculty_courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"faculty_id", "course_id"})
})
public class FacultyCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyProfile faculty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public FacultyCourse() {}

    public FacultyCourse(FacultyProfile faculty, Course course) {
        this.faculty = faculty;
        this.course = course;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FacultyProfile getFaculty() { return faculty; }
    public void setFaculty(FacultyProfile faculty) { this.faculty = faculty; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
}
