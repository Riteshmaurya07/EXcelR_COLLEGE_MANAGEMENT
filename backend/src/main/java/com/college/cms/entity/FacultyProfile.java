package com.college.cms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "faculty_profiles", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id"),
    @UniqueConstraint(columnNames = "employee_id")
})
public class FacultyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false, length = 100)
    private String designation;

    @Column(length = 20)
    private String phone;

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<FacultyCourse> facultyCourses = new ArrayList<>();

    @OneToMany(mappedBy = "faculty", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<FacultyAttendance> attendances = new ArrayList<>();

    public FacultyProfile() {}

    public FacultyProfile(User user, String employeeId, String firstName, String lastName, String department, String designation, String phone) {
        this.user = user;
        this.employeeId = employeeId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.designation = designation;
        this.phone = phone;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<FacultyCourse> getFacultyCourses() { return facultyCourses; }
    public void setFacultyCourses(List<FacultyCourse> facultyCourses) { this.facultyCourses = facultyCourses; }

    public List<FacultyAttendance> getAttendances() { return attendances; }
    public void setAttendances(List<FacultyAttendance> attendances) { this.attendances = attendances; }
}
