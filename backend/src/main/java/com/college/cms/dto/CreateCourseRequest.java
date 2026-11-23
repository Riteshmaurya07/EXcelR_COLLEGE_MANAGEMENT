package com.college.cms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateCourseRequest {
    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotBlank(message = "Course code is required")
    private String courseCode;

    @NotNull(message = "Credits is required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Semester is required")
    private Integer semester;

    private String description;

    public CreateCourseRequest() {}

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
}
