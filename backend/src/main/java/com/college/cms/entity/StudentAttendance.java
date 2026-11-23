package com.college.cms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_course_id", "class_date"})
})
public class StudentAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_course_id", nullable = false)
    private StudentCourse studentCourse;

    @Column(name = "class_date", nullable = false)
    private LocalDate classDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by_faculty_id", nullable = true)
    private FacultyProfile markedByFaculty;

    @Column(length = 255)
    private String remarks;

    public StudentAttendance() {}

    public StudentAttendance(StudentCourse studentCourse, LocalDate classDate, AttendanceStatus status, FacultyProfile markedByFaculty, String remarks) {
        this.studentCourse = studentCourse;
        this.classDate = classDate;
        this.status = status;
        this.markedByFaculty = markedByFaculty;
        this.remarks = remarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public StudentCourse getStudentCourse() { return studentCourse; }
    public void setStudentCourse(StudentCourse studentCourse) { this.studentCourse = studentCourse; }

    public LocalDate getClassDate() { return classDate; }
    public void setClassDate(LocalDate classDate) { this.classDate = classDate; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public FacultyProfile getMarkedByFaculty() { return markedByFaculty; }
    public void setMarkedByFaculty(FacultyProfile markedByFaculty) { this.markedByFaculty = markedByFaculty; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
