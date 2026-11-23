package com.college.cms.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {
    private long totalStudents;
    private long totalFaculty;
    private long totalCourses;
    private Double todayAttendancePercentage;
    private String todayAttendanceDisplay;
    private Boolean isWeekend;
    private String currentSessionName;
    private List<Map<String, Object>> lowAttendanceStudents;
    private List<Map<String, Object>> departmentStudentCounts;

    public DashboardStatsResponse() {}

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }

    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public Double getTodayAttendancePercentage() { return todayAttendancePercentage; }
    public void setTodayAttendancePercentage(Double todayAttendancePercentage) { this.todayAttendancePercentage = todayAttendancePercentage; }

    public String getTodayAttendanceDisplay() { return todayAttendanceDisplay; }
    public void setTodayAttendanceDisplay(String todayAttendanceDisplay) { this.todayAttendanceDisplay = todayAttendanceDisplay; }

    public Boolean getIsWeekend() { return isWeekend; }
    public void setIsWeekend(Boolean isWeekend) { this.isWeekend = isWeekend; }

    public String getCurrentSessionName() { return currentSessionName; }
    public void setCurrentSessionName(String currentSessionName) { this.currentSessionName = currentSessionName; }

    public List<Map<String, Object>> getLowAttendanceStudents() { return lowAttendanceStudents; }
    public void setLowAttendanceStudents(List<Map<String, Object>> lowAttendanceStudents) { this.lowAttendanceStudents = lowAttendanceStudents; }

    public List<Map<String, Object>> getDepartmentStudentCounts() { return departmentStudentCounts; }
    public void setDepartmentStudentCounts(List<Map<String, Object>> departmentStudentCounts) { this.departmentStudentCounts = departmentStudentCounts; }
}
