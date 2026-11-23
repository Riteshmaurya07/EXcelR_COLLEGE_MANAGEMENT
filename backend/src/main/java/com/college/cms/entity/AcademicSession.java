package com.college.cms.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "academic_sessions")
public class AcademicSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_name", nullable = false, length = 100)
    private String sessionName;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = false;

    public AcademicSession() {}

    public AcademicSession(String sessionName, LocalDate startDate, LocalDate endDate, Boolean isCurrent) {
        this.sessionName = sessionName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isCurrent = isCurrent != null ? isCurrent : false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionName() { return sessionName; }
    public void setSessionName(String sessionName) { this.sessionName = sessionName; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Boolean getIsCurrent() { return isCurrent; }
    public void setIsCurrent(Boolean isCurrent) { this.isCurrent = isCurrent; }
}
