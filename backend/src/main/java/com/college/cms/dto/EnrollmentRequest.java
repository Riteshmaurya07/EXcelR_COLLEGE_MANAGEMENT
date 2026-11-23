package com.college.cms.dto;

import jakarta.validation.constraints.NotNull;

public class EnrollmentRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private Boolean openElective = false;

    public EnrollmentRequest() {}

    public EnrollmentRequest(Long studentId, Long courseId) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.openElective = false;
    }

    public EnrollmentRequest(Long studentId, Long courseId, Boolean openElective) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.openElective = openElective;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Boolean getOpenElective() { return openElective; }
    public void setOpenElective(Boolean openElective) { this.openElective = openElective; }
}
