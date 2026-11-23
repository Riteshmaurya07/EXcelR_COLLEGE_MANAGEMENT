package com.college.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class CompleteProfileRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+ -]{10,15}$", message = "Phone must be at least 10 digits")
    private String phone;

    public CompleteProfileRequest() {}

    public CompleteProfileRequest(String fullName, String department, Integer semester, String phone) {
        this.fullName = fullName;
        this.department = department;
        this.semester = semester;
        this.phone = phone;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
