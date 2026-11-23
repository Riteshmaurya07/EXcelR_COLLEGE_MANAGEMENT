package com.college.cms.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class MarkAttendanceRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Class date is required")
    private LocalDate classDate;

    @NotEmpty(message = "Records list cannot be empty")
    private List<StudentAttendanceItem> records;

    public MarkAttendanceRequest() {}

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public LocalDate getClassDate() { return classDate; }
    public void setClassDate(LocalDate classDate) { this.classDate = classDate; }

    public List<StudentAttendanceItem> getRecords() { return records; }
    public void setRecords(List<StudentAttendanceItem> records) { this.records = records; }
}
