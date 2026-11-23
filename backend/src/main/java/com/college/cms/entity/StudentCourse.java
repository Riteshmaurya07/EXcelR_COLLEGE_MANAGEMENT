package com.college.cms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id"})
})
public class StudentCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ENROLLED;

    @Column(name = "enrolled_on", nullable = false)
    private LocalDateTime enrolledOn = LocalDateTime.now();

    @Column(name = "open_elective", nullable = false)
    private Boolean openElective = false;

    @OneToMany(mappedBy = "studentCourse", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudentAttendance> attendances = new ArrayList<>();

    public StudentCourse() {}

    public StudentCourse(StudentProfile student, Course course, EnrollmentStatus status) {
        this.student = student;
        this.course = course;
        this.status = status;
        this.enrolledOn = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (enrolledOn == null) {
            enrolledOn = LocalDateTime.now();
        }
        if (status == null) {
            status = EnrollmentStatus.ENROLLED;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentProfile getStudent() { return student; }
    public void setStudent(StudentProfile student) { this.student = student; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) { this.status = status; }

    public LocalDateTime getEnrolledOn() { return enrolledOn; }
    public void setEnrolledOn(LocalDateTime enrolledOn) { this.enrolledOn = enrolledOn; }

    public List<StudentAttendance> getAttendances() { return attendances; }
    public void setAttendances(List<StudentAttendance> attendances) { this.attendances = attendances; }

    public Boolean getOpenElective() { return openElective; }
    public void setOpenElective(Boolean openElective) { this.openElective = openElective; }
}
