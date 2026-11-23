package com.college.cms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "faculty_attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"faculty_id", "attendance_date"})
})
public class FacultyAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faculty_id", nullable = false)
    private FacultyProfile faculty;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    public FacultyAttendance() {}

    public FacultyAttendance(FacultyProfile faculty, LocalDate attendanceDate, AttendanceStatus status) {
        this.faculty = faculty;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FacultyProfile getFaculty() { return faculty; }
    public void setFaculty(FacultyProfile faculty) { this.faculty = faculty; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
}
