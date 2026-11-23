package com.college.cms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "student_profiles", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id"),
    @UniqueConstraint(columnNames = "roll_no")
})
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "roll_no", nullable = false, unique = true, length = 50)
    private String rollNo;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(length = 20)
    private String phone;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<StudentCourse> studentCourses = new ArrayList<>();

    public StudentProfile() {}

    public StudentProfile(User user, String rollNo, String firstName, String lastName, String department, Integer semester, String phone) {
        this.user = user;
        this.rollNo = rollNo;
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department;
        this.semester = semester;
        this.phone = phone;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<StudentCourse> getStudentCourses() { return studentCourses; }
    public void setStudentCourses(List<StudentCourse> studentCourses) { this.studentCourses = studentCourses; }
}
