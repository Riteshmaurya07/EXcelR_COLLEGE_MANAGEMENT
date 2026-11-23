package com.college.cms.dto;

import java.util.Map;

public class UserProfileResponse {
    private Long id;
    private String email;
    private String role;
    private String status;
    private Map<String, Object> details;

    public UserProfileResponse() {}

    public UserProfileResponse(Long id, String email, String role, String status, Map<String, Object> details) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.status = status;
        this.details = details;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Map<String, Object> getDetails() { return details; }
    public void setDetails(Map<String, Object> details) { this.details = details; }
}
