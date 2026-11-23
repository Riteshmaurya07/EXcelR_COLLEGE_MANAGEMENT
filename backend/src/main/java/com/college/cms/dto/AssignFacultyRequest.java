package com.college.cms.dto;

import jakarta.validation.constraints.NotNull;

public class AssignFacultyRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;

    public AssignFacultyRequest() {}

    public AssignFacultyRequest(Long courseId, Long facultyId) {
        this.courseId = courseId;
        this.facultyId = facultyId;
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
}
