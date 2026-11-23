package com.college.cms.service.impl;

import com.college.cms.dto.*;
import com.college.cms.entity.*;
import com.college.cms.exception.BadRequestException;
import com.college.cms.exception.DuplicateResourceException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.*;
import com.college.cms.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentCourseRepository studentCourseRepository;

    @Autowired
    private FacultyCourseRepository facultyCourseRepository;

    @Autowired
    private StudentAttendanceRepository studentAttendanceRepository;

    @Autowired
    private FacultyAttendanceRepository facultyAttendanceRepository;

    @Autowired
    private AcademicSessionRepository academicSessionRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long totalStudents = studentProfileRepository.count();
        long totalFaculty = facultyProfileRepository.count();
        long totalCourses = courseRepository.count();

        stats.setTotalStudents(totalStudents);
        stats.setTotalFaculty(totalFaculty);
        stats.setTotalCourses(totalCourses);

        LocalDate today = LocalDate.now();
        DayOfWeek dow = today.getDayOfWeek();
        boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
        stats.setIsWeekend(isWeekend);

        Optional<AcademicSession> currentSessionOpt = academicSessionRepository.findByIsCurrentTrue();
        boolean isInsideCurrentSession = currentSessionOpt.isPresent()
            && !today.isBefore(currentSessionOpt.get().getStartDate())
            && !today.isAfter(currentSessionOpt.get().getEndDate());

        currentSessionOpt.ifPresent(s -> stats.setCurrentSessionName(s.getSessionName()));

        Optional<Holiday> holidayOpt = holidayRepository.findByDate(today);

        if (isWeekend) {
            stats.setTodayAttendanceDisplay("Weekend (Holiday)");
            stats.setTodayAttendancePercentage(0.0);
        } else if (holidayOpt.isPresent()) {
            stats.setTodayAttendanceDisplay(holidayOpt.get().getName() + " (Holiday)");
            stats.setTodayAttendancePercentage(0.0);
        } else if (isInsideCurrentSession) {
            List<StudentAttendance> todayAttendance = studentAttendanceRepository.findByDate(today);
            if (!todayAttendance.isEmpty()) {
                long presentCount = todayAttendance.stream()
                    .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                    .count();
                double todayPct = Math.round(((double) presentCount / todayAttendance.size()) * 1000.0) / 10.0;
                stats.setTodayAttendancePercentage(todayPct);
                stats.setTodayAttendanceDisplay(todayPct + "%");
            } else {
                stats.setTodayAttendancePercentage(null);
                stats.setTodayAttendanceDisplay("Not marked yet");
            }
        } else {
            stats.setTodayAttendanceDisplay("N/A");
            stats.setTodayAttendancePercentage(0.0);
        }

        // Low attendance students (< 75%)
        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        List<Map<String, Object>> lowAttendanceList = new ArrayList<>();

        for (StudentProfile student : allStudents) {
            List<StudentCourse> studentCourses = studentCourseRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.ENROLLED);
            long totalRecords = 0;
            long presentRecords = 0;

            for (StudentCourse sc : studentCourses) {
                List<StudentAttendance> attList = studentAttendanceRepository.findByStudentCourseId(sc.getId());
                for (StudentAttendance sa : attList) {
                    if (sa.getStatus() == AttendanceStatus.PRESENT) {
                        presentRecords++;
                        totalRecords++;
                    } else if (sa.getStatus() == AttendanceStatus.ABSENT || sa.getStatus() == AttendanceStatus.LEAVE) {
                        totalRecords++;
                    }
                }
            }

            double percentage = totalRecords > 0 ? (Math.round(((double) presentRecords / totalRecords) * 1000.0) / 10.0) : 100.0;
            if (totalRecords > 0 && percentage < 75.0) {
                Map<String, Object> map = new HashMap<>();
                map.put("studentId", student.getId());
                map.put("rollNo", student.getRollNo());
                map.put("name", student.getFirstName() + " " + student.getLastName());
                map.put("department", student.getDepartment());
                map.put("semester", student.getSemester());
                map.put("attendancePercentage", percentage);
                lowAttendanceList.add(map);
            }
        }
        stats.setLowAttendanceStudents(lowAttendanceList);

        // Department-wise student counts
        List<Object[]> deptCounts = studentProfileRepository.countStudentsByDepartment();
        List<Map<String, Object>> deptList = new ArrayList<>();
        for (Object[] row : deptCounts) {
            Map<String, Object> map = new HashMap<>();
            map.put("department", row[0]);
            map.put("count", row[1]);
            deptList.add(map);
        }
        stats.setDepartmentStudentCounts(deptList);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllStudents() {
        return studentProfileRepository.findAll().stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("userId", s.getUser().getId());
            map.put("rollNo", s.getRollNo());
            map.put("firstName", s.getFirstName());
            map.put("lastName", s.getLastName());
            map.put("name", s.getFirstName() + " " + s.getLastName());
            map.put("department", s.getDepartment());
            map.put("semester", s.getSemester());
            map.put("phone", s.getPhone());
            map.put("email", s.getUser().getEmail());
            map.put("status", s.getUser().getStatus().name());
            map.put("createdAt", s.getUser().getCreatedAt());
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> createStudent(CreateStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
        if (studentProfileRepository.existsByRollNo(request.getRollNo())) {
            throw new DuplicateResourceException("Roll number already exists: " + request.getRollNo());
        }

        User user = new User(request.getEmail(), passwordEncoder.encode(request.getPassword()), Role.STUDENT, UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile(
            savedUser,
            request.getRollNo(),
            request.getFirstName(),
            request.getLastName(),
            request.getDepartment(),
            request.getSemester(),
            request.getPhone()
        );
        StudentProfile savedProfile = studentProfileRepository.save(profile);
        savedUser.setStudentProfile(savedProfile);

        Map<String, Object> res = new HashMap<>();
        res.put("id", savedProfile.getId());
        res.put("rollNo", savedProfile.getRollNo());
        res.put("name", savedProfile.getFirstName() + " " + savedProfile.getLastName());
        res.put("email", savedUser.getEmail());
        return res;
    }

    @Override
    public Map<String, Object> updateStudent(Long id, UpdateStudentRequest request) {
        StudentProfile student = studentProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setDepartment(request.getDepartment());
        student.setSemester(request.getSemester());
        student.setPhone(request.getPhone());

        if (request.getStatus() != null) {
            try {
                student.getUser().setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        StudentProfile updated = studentProfileRepository.save(student);
        Map<String, Object> res = new HashMap<>();
        res.put("id", updated.getId());
        res.put("rollNo", updated.getRollNo());
        res.put("name", updated.getFirstName() + " " + updated.getLastName());
        res.put("department", updated.getDepartment());
        res.put("semester", updated.getSemester());
        return res;
    }

    @Override
    public void toggleStudentStatus(Long id) {
        StudentProfile student = studentProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        User user = student.getUser();
        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllFaculties() {
        return facultyProfileRepository.findAll().stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("userId", f.getUser().getId());
            map.put("employeeId", f.getEmployeeId());
            map.put("firstName", f.getFirstName());
            map.put("lastName", f.getLastName());
            map.put("name", f.getFirstName() + " " + f.getLastName());
            map.put("department", f.getDepartment());
            map.put("designation", f.getDesignation());
            map.put("phone", f.getPhone());
            map.put("email", f.getUser().getEmail());
            map.put("role", f.getUser().getRole().name());
            map.put("status", f.getUser().getStatus().name());
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> createFacultyOrAdmin(CreateFacultyRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }
        if (facultyProfileRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new DuplicateResourceException("Employee ID already exists: " + request.getEmployeeId());
        }

        Role role = Role.FACULTY;
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            role = Role.ADMIN;
        }

        User user = new User(request.getEmail(), passwordEncoder.encode(request.getPassword()), role, UserStatus.ACTIVE);
        User savedUser = userRepository.save(user);

        FacultyProfile profile = new FacultyProfile(
            savedUser,
            request.getEmployeeId(),
            request.getFirstName(),
            request.getLastName(),
            request.getDepartment(),
            request.getDesignation(),
            request.getPhone()
        );
        FacultyProfile savedProfile = facultyProfileRepository.save(profile);
        savedUser.setFacultyProfile(savedProfile);

        Map<String, Object> res = new HashMap<>();
        res.put("id", savedProfile.getId());
        res.put("employeeId", savedProfile.getEmployeeId());
        res.put("name", savedProfile.getFirstName() + " " + savedProfile.getLastName());
        res.put("email", savedUser.getEmail());
        res.put("role", savedUser.getRole().name());
        return res;
    }

    @Override
    public Map<String, Object> updateFaculty(Long id, UpdateFacultyRequest request) {
        FacultyProfile faculty = facultyProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));

        faculty.setFirstName(request.getFirstName());
        faculty.setLastName(request.getLastName());
        faculty.setDepartment(request.getDepartment());
        faculty.setDesignation(request.getDesignation());
        faculty.setPhone(request.getPhone());

        if (request.getStatus() != null) {
            try {
                faculty.getUser().setStatus(UserStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        FacultyProfile updated = facultyProfileRepository.save(faculty);
        Map<String, Object> res = new HashMap<>();
        res.put("id", updated.getId());
        res.put("employeeId", updated.getEmployeeId());
        res.put("name", updated.getFirstName() + " " + updated.getLastName());
        return res;
    }

    @Override
    public void toggleFacultyStatus(Long id) {
        FacultyProfile faculty = facultyProfileRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + id));
        User user = faculty.getUser();
        user.setStatus(user.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllCourses() {
        return courseRepository.findAll().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("courseName", c.getCourseName());
            map.put("courseCode", c.getCourseCode());
            map.put("credits", c.getCredits());
            map.put("department", c.getDepartment());
            map.put("semester", c.getSemester());
            map.put("description", c.getDescription());

            List<FacultyCourse> fcs = facultyCourseRepository.findByCourseId(c.getId());
            List<Map<String, Object>> assignedFaculties = fcs.stream().map(fc -> {
                Map<String, Object> fMap = new HashMap<>();
                fMap.put("facultyId", fc.getFaculty().getId());
                fMap.put("facultyName", fc.getFaculty().getFirstName() + " " + fc.getFaculty().getLastName());
                fMap.put("employeeId", fc.getFaculty().getEmployeeId());
                fMap.put("department", fc.getFaculty().getDepartment());
                return fMap;
            }).collect(Collectors.toList());

            map.put("assignedFaculties", assignedFaculties);
            long enrolledCount = studentCourseRepository.countEnrolledStudentsInCourse(c.getId());
            map.put("enrolledCount", enrolledCount);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> createCourse(CreateCourseRequest request) {
        if (courseRepository.existsByCourseCode(request.getCourseCode())) {
            throw new DuplicateResourceException("Course code already exists: " + request.getCourseCode());
        }

        Course course = new Course(
            request.getCourseName(),
            request.getCourseCode(),
            request.getCredits(),
            request.getDepartment(),
            request.getSemester(),
            request.getDescription()
        );
        Course saved = courseRepository.save(course);

        Map<String, Object> res = new HashMap<>();
        res.put("id", saved.getId());
        res.put("courseName", saved.getCourseName());
        res.put("courseCode", saved.getCourseCode());
        return res;
    }

    @Override
    public Map<String, Object> updateCourse(Long id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (request.getCourseCode() != null && !request.getCourseCode().trim().equalsIgnoreCase(course.getCourseCode())) {
            long enrolledCount = studentCourseRepository.countEnrolledStudentsInCourse(id);
            if (enrolledCount > 0) {
                throw new BadRequestException("Cannot change course code while students are actively enrolled in this course.");
            }
            if (courseRepository.existsByCourseCode(request.getCourseCode().trim())) {
                throw new DuplicateResourceException("Course code already exists: " + request.getCourseCode());
            }
            course.setCourseCode(request.getCourseCode().trim());
        }

        course.setCourseName(request.getCourseName().trim());
        course.setCredits(request.getCredits());
        course.setSemester(request.getSemester());
        course.setDescription(request.getDescription());
        Course saved = courseRepository.save(course);

        Map<String, Object> res = new HashMap<>();
        res.put("id", saved.getId());
        res.put("courseName", saved.getCourseName());
        res.put("courseCode", saved.getCourseCode());
        res.put("credits", saved.getCredits());
        res.put("department", saved.getDepartment());
        res.put("semester", saved.getSemester());
        res.put("description", saved.getDescription());
        return res;
    }

    @Override
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        long enrolledCount = studentCourseRepository.findByCourseId(id).size();
        long facultyCount = facultyCourseRepository.findByCourseId(id).size();

        if (enrolledCount > 0 || facultyCount > 0) {
            throw new BadRequestException("Cannot delete course with active enrollments or assigned faculty. Remove enrollments and unassign faculty first.");
        }

        courseRepository.delete(course);
    }

    @Override
    public void unassignFaculty(Long courseId, Long facultyId) {
        FacultyCourse fc = facultyCourseRepository.findByFacultyIdAndCourseId(facultyId, courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Faculty is not assigned to this course."));
        facultyCourseRepository.delete(fc);
    }

    @Override
    public void assignFaculty(AssignFacultyRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));
        FacultyProfile faculty = facultyProfileRepository.findById(request.getFacultyId())
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + request.getFacultyId()));

        if (!faculty.getDepartment().equalsIgnoreCase(course.getDepartment())) {
            throw new BadRequestException("Faculty belongs to " + faculty.getDepartment() + " department, but course belongs to " + course.getDepartment() + ".");
        }

        if (facultyCourseRepository.existsByFacultyIdAndCourseId(faculty.getId(), course.getId())) {
            throw new BadRequestException("Faculty is already assigned to this course.");
        }

        FacultyCourse fc = new FacultyCourse(faculty, course);
        facultyCourseRepository.save(fc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllEnrolments() {
        return studentCourseRepository.findAll().stream().map(sc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", sc.getId());
            map.put("studentId", sc.getStudent().getId());
            map.put("studentName", sc.getStudent().getFirstName() + " " + sc.getStudent().getLastName());
            map.put("rollNo", sc.getStudent().getRollNo());
            map.put("department", sc.getStudent().getDepartment());
            map.put("semester", sc.getStudent().getSemester());
            map.put("courseId", sc.getCourse().getId());
            map.put("courseName", sc.getCourse().getCourseName());
            map.put("courseCode", sc.getCourse().getCourseCode());
            map.put("status", sc.getStatus().name());
            map.put("enrolledOn", sc.getEnrolledOn());
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public void enrolStudent(EnrollmentRequest request) {
        StudentProfile student = studentProfileRepository.findById(request.getStudentId())
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        if (!course.getSemester().equals(student.getSemester())) {
            throw new BadRequestException("This course is for Semester " + course.getSemester() + ", you are in Semester " + student.getSemester() + ".");
        }

        boolean isOpenElective = Boolean.TRUE.equals(request.getOpenElective());
        if (!course.getDepartment().equalsIgnoreCase(student.getDepartment()) && !isOpenElective) {
            throw new BadRequestException("This course belongs to " + course.getDepartment() + " department, you are in " + student.getDepartment() + ".");
        }

        Optional<StudentCourse> existingOpt = studentCourseRepository.findByStudentIdAndCourseId(student.getId(), course.getId());
        if (existingOpt.isPresent()) {
            StudentCourse sc = existingOpt.get();
            if (sc.getStatus() == EnrollmentStatus.ENROLLED) {
                throw new BadRequestException("Student is already enrolled in this course.");
            }
            sc.setStatus(EnrollmentStatus.ENROLLED);
            sc.setOpenElective(isOpenElective);
            sc.setEnrolledOn(LocalDateTime.now());
            studentCourseRepository.save(sc);
            return;
        }

        StudentCourse sc = new StudentCourse(student, course, EnrollmentStatus.ENROLLED);
        sc.setOpenElective(isOpenElective);
        studentCourseRepository.save(sc);
    }

    @Override
    public void dropStudent(EnrollmentRequest request) {
        StudentCourse sc = studentCourseRepository.findByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())
            .orElseThrow(() -> new ResourceNotFoundException("Student is not enrolled in this course."));
        sc.setStatus(EnrollmentStatus.DROPPED);
        studentCourseRepository.save(sc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentAttendanceReport(Long courseId, LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().minusDays(30);
        if (toDate == null) toDate = LocalDate.now();

        List<StudentCourse> enrolledCourses;
        if (courseId != null && courseId > 0) {
            enrolledCourses = studentCourseRepository.findByCourseIdAndStatus(courseId, EnrollmentStatus.ENROLLED);
        } else {
            enrolledCourses = studentCourseRepository.findAll().stream()
                .filter(sc -> sc.getStatus() == EnrollmentStatus.ENROLLED)
                .collect(Collectors.toList());
        }

        List<Map<String, Object>> report = new ArrayList<>();
        for (StudentCourse sc : enrolledCourses) {
            List<StudentAttendance> attList = studentAttendanceRepository.findByStudentCourseIdAndDateRange(sc.getId(), fromDate, toDate);

            long presentCount = 0;
            long absentCount = 0;
            long leaveCount = 0;
            long holidayCount = 0;
            long totalWorkingDays = 0;

            for (StudentAttendance sa : attList) {
                if (sa.getStatus() == AttendanceStatus.PRESENT) {
                    presentCount++;
                    totalWorkingDays++;
                } else if (sa.getStatus() == AttendanceStatus.ABSENT) {
                    absentCount++;
                    totalWorkingDays++;
                } else if (sa.getStatus() == AttendanceStatus.LEAVE) {
                    leaveCount++;
                    totalWorkingDays++;
                } else if (sa.getStatus() == AttendanceStatus.HOLIDAY) {
                    holidayCount++;
                }
            }

            double percentage = totalWorkingDays > 0 ? (Math.round(((double) presentCount / totalWorkingDays) * 1000.0) / 10.0) : 0.0;

            Map<String, Object> row = new HashMap<>();
            row.put("studentId", sc.getStudent().getId());
            row.put("rollNo", sc.getStudent().getRollNo());
            row.put("studentName", sc.getStudent().getFirstName() + " " + sc.getStudent().getLastName());
            row.put("courseId", sc.getCourse().getId());
            row.put("courseName", sc.getCourse().getCourseName());
            row.put("courseCode", sc.getCourse().getCourseCode());
            row.put("presentCount", presentCount);
            row.put("absentCount", absentCount);
            row.put("leaveCount", leaveCount);
            row.put("holidayCount", holidayCount);
            row.put("totalDays", totalWorkingDays);
            row.put("attendancePercentage", percentage);

            report.add(row);
        }
        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFacultyAttendanceReport(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().minusDays(30);
        if (toDate == null) toDate = LocalDate.now();

        List<FacultyProfile> allFaculties = facultyProfileRepository.findAll();
        List<Map<String, Object>> report = new ArrayList<>();

        for (FacultyProfile fp : allFaculties) {
            List<FacultyAttendance> attList = facultyAttendanceRepository.findByFacultyIdAndDateRange(fp.getId(), fromDate, toDate);

            long presentCount = 0;
            long absentCount = 0;
            long leaveCount = 0;
            long holidayCount = 0;
            long totalWorkingDays = 0;

            for (FacultyAttendance fa : attList) {
                if (fa.getStatus() == AttendanceStatus.PRESENT) {
                    presentCount++;
                    totalWorkingDays++;
                } else if (fa.getStatus() == AttendanceStatus.ABSENT) {
                    absentCount++;
                    totalWorkingDays++;
                } else if (fa.getStatus() == AttendanceStatus.LEAVE) {
                    leaveCount++;
                    totalWorkingDays++;
                } else if (fa.getStatus() == AttendanceStatus.HOLIDAY) {
                    holidayCount++;
                }
            }

            double percentage = totalWorkingDays > 0 ? (Math.round(((double) presentCount / totalWorkingDays) * 1000.0) / 10.0) : 0.0;

            Map<String, Object> row = new HashMap<>();
            row.put("facultyId", fp.getId());
            row.put("employeeId", fp.getEmployeeId());
            row.put("facultyName", fp.getFirstName() + " " + fp.getLastName());
            row.put("department", fp.getDepartment());
            row.put("designation", fp.getDesignation());
            row.put("presentCount", presentCount);
            row.put("absentCount", absentCount);
            row.put("leaveCount", leaveCount);
            row.put("holidayCount", holidayCount);
            row.put("totalDays", totalWorkingDays);
            row.put("attendancePercentage", percentage);

            report.add(row);
        }
        return report;
    }

    @Override
    public void markFacultyAttendanceByAdmin(AdminMarkFacultyAttendanceRequest request) {
        // Business rule 1: Sat-Sun are automatically holidays. No attendance can be marked on Sat/Sun.
        if (request.getAttendanceDate().getDayOfWeek() == DayOfWeek.SATURDAY || 
            request.getAttendanceDate().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new BadRequestException("Attendance cannot be marked on weekends (Saturday/Sunday).");
        }

        if (holidayRepository.existsByDate(request.getAttendanceDate())) {
            Holiday h = holidayRepository.findByDate(request.getAttendanceDate()).orElse(null);
            String hName = h != null ? h.getName() : "Holiday";
            throw new BadRequestException("Attendance cannot be marked on " + hName + " (holiday).");
        }

        FacultyProfile faculty = facultyProfileRepository.findById(request.getFacultyId())
            .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + request.getFacultyId()));

        AttendanceStatus status;
        try {
            status = AttendanceStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.getStatus());
        }

        // Duplicate mark updates the same record
        Optional<FacultyAttendance> existingOpt = facultyAttendanceRepository.findByFacultyIdAndAttendanceDate(faculty.getId(), request.getAttendanceDate());
        if (existingOpt.isPresent()) {
            FacultyAttendance fa = existingOpt.get();
            fa.setStatus(status);
            facultyAttendanceRepository.save(fa);
        } else {
            FacultyAttendance fa = new FacultyAttendance(faculty, request.getAttendanceDate(), status);
            facultyAttendanceRepository.save(fa);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AcademicSession> getAllSessions() {
        return academicSessionRepository.findAll();
    }

    @Override
    public AcademicSession createSession(CreateSessionRequest request) {
        if (academicSessionRepository.existsBySessionName(request.getSessionName())) {
            throw new DuplicateResourceException("Session name already exists: " + request.getSessionName());
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        AcademicSession session = new AcademicSession(
            request.getSessionName(),
            request.getStartDate(),
            request.getEndDate(),
            request.getIsCurrent()
        );

        if (Boolean.TRUE.equals(request.getIsCurrent())) {
            // Deactivate all others
            List<AcademicSession> all = academicSessionRepository.findAll();
            all.forEach(s -> s.setIsCurrent(false));
            academicSessionRepository.saveAll(all);
        }

        return academicSessionRepository.save(session);
    }

    @Override
    public AcademicSession activateSession(Long sessionId) {
        AcademicSession session = academicSessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Academic session not found with id: " + sessionId));

        List<AcademicSession> all = academicSessionRepository.findAll();
        for (AcademicSession s : all) {
            s.setIsCurrent(s.getId().equals(sessionId));
        }
        academicSessionRepository.saveAll(all);

        return session;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAllByOrderByDateAsc();
    }

    @Override
    public Holiday createHoliday(CreateHolidayRequest request) {
        if (request.getDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Holiday date cannot be in the past.");
        }
        if (holidayRepository.existsByDate(request.getDate())) {
            throw new BadRequestException("A holiday already exists on date: " + request.getDate());
        }
        Holiday holiday = new Holiday(request.getDate(), request.getName().trim(), "ADMIN");
        return holidayRepository.save(holiday);
    }

    @Override
    public void deleteHoliday(Long id) {
        Holiday holiday = holidayRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Holiday not found with id: " + id));
        holidayRepository.delete(holiday);
    }
}
