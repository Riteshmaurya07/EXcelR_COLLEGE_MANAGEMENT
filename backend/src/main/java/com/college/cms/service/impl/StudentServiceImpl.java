package com.college.cms.service.impl;

import com.college.cms.entity.*;
import com.college.cms.exception.BadRequestException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.*;
import com.college.cms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentCourseRepository studentCourseRepository;

    @Autowired
    private FacultyCourseRepository facultyCourseRepository;

    @Autowired
    private StudentAttendanceRepository studentAttendanceRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    private StudentProfile getStudentByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        if (user.getStudentProfile() == null) {
            throw new ResourceNotFoundException("Student profile not found for user: " + email);
        }
        return user.getStudentProfile();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentDashboard(String studentEmail) {
        StudentProfile student = getStudentByEmail(studentEmail);
        List<StudentCourse> enrolledCourses = studentCourseRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.ENROLLED);

        long totalWorking = 0;
        long totalPresent = 0;

        for (StudentCourse sc : enrolledCourses) {
            List<StudentAttendance> attList = studentAttendanceRepository.findByStudentCourseId(sc.getId());
            for (StudentAttendance sa : attList) {
                if (sa.getStatus() == AttendanceStatus.PRESENT) {
                    totalPresent++;
                    totalWorking++;
                } else if (sa.getStatus() == AttendanceStatus.ABSENT || sa.getStatus() == AttendanceStatus.LEAVE) {
                    totalWorking++;
                }
            }
        }

        double overallPercentage = totalWorking > 0 ? (Math.round(((double) totalPresent / totalWorking) * 1000.0) / 10.0) : 0.0;

        // Today's classes
        LocalDate today = LocalDate.now();
        DayOfWeek dow = today.getDayOfWeek();
        Optional<Holiday> todayHoliday = holidayRepository.findByDate(today);
        boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
        boolean isHoliday = isWeekend || todayHoliday.isPresent();
        String holidayName = isWeekend ? "Weekend (Holiday)" : (todayHoliday.isPresent() ? todayHoliday.get().getName() + " (Holiday)" : null);

        List<Map<String, Object>> todayClasses = new ArrayList<>();

        if (!isHoliday) {
            List<Map<String, Object>> timetable = getTimetable(studentEmail);
            String dayStr = dow.name(); // MONDAY, TUESDAY, etc.
            for (Map<String, Object> slot : timetable) {
                if (dayStr.equalsIgnoreCase((String) slot.get("day"))) {
                    todayClasses.add(slot);
                }
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("studentName", student.getFirstName() + " " + student.getLastName());
        response.put("rollNo", student.getRollNo());
        response.put("department", student.getDepartment());
        response.put("semester", student.getSemester());
        response.put("enrolledCoursesCount", enrolledCourses.size());
        response.put("overallAttendancePercentage", overallPercentage);
        response.put("isWeekend", isWeekend);
        response.put("isHoliday", isHoliday);
        response.put("holidayName", holidayName);
        response.put("todayClasses", todayClasses);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllAvailableCourses(String studentEmail) {
        StudentProfile student = getStudentByEmail(studentEmail);
        List<Course> allCourses = courseRepository.findAll();
        List<StudentCourse> enrolledCourses = studentCourseRepository.findByStudentId(student.getId());

        Set<Long> enrolledCourseIds = enrolledCourses.stream()
            .filter(sc -> sc.getStatus() == EnrollmentStatus.ENROLLED)
            .map(sc -> sc.getCourse().getId())
            .collect(Collectors.toSet());

        return allCourses.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("courseName", c.getCourseName());
            map.put("courseCode", c.getCourseCode());
            map.put("credits", c.getCredits());
            map.put("department", c.getDepartment());
            map.put("semester", c.getSemester());
            map.put("description", c.getDescription());
            map.put("isEnrolled", enrolledCourseIds.contains(c.getId()));
            boolean matchesSem = c.getSemester() != null && c.getSemester().equals(student.getSemester());
            boolean matchesDept = c.getDepartment() != null && c.getDepartment().equalsIgnoreCase(student.getDepartment());
            map.put("canEnroll", matchesSem && matchesDept);
            map.put("studentSemester", student.getSemester());
            map.put("studentDepartment", student.getDepartment());

            List<FacultyCourse> fcs = facultyCourseRepository.findByCourseId(c.getId());
            String facultyNames = fcs.stream()
                .map(fc -> fc.getFaculty().getFirstName() + " " + fc.getFaculty().getLastName())
                .collect(Collectors.joining(", "));
            map.put("assignedFaculty", facultyNames.isEmpty() ? "Not Assigned" : facultyNames);

            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyEnrolledCourses(String studentEmail) {
        StudentProfile student = getStudentByEmail(studentEmail);
        List<StudentCourse> list = studentCourseRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.ENROLLED);

        return list.stream().map(sc -> {
            Course c = sc.getCourse();
            Map<String, Object> map = new HashMap<>();
            map.put("id", sc.getId());
            map.put("courseId", c.getId());
            map.put("courseName", c.getCourseName());
            map.put("courseCode", c.getCourseCode());
            map.put("credits", c.getCredits());
            map.put("department", c.getDepartment());
            map.put("semester", c.getSemester());
            map.put("enrolledOn", sc.getEnrolledOn());

            List<FacultyCourse> fcs = facultyCourseRepository.findByCourseId(c.getId());
            String facultyNames = fcs.stream()
                .map(fc -> fc.getFaculty().getFirstName() + " " + fc.getFaculty().getLastName())
                .collect(Collectors.joining(", "));
            map.put("assignedFaculty", facultyNames.isEmpty() ? "To Be Announced" : facultyNames);

            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public void enrolInCourse(String studentEmail, Long courseId) {
        StudentProfile student = getStudentByEmail(studentEmail);
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (!course.getDepartment().equalsIgnoreCase(student.getDepartment())) {
            throw new BadRequestException("This course belongs to " + course.getDepartment() + " department, you are in " + student.getDepartment() + ".");
        }

        if (!course.getSemester().equals(student.getSemester())) {
            throw new BadRequestException("This course is for Semester " + course.getSemester() + ", you are in Semester " + student.getSemester() + ".");
        }

        Optional<StudentCourse> existingOpt = studentCourseRepository.findByStudentIdAndCourseId(student.getId(), course.getId());
        if (existingOpt.isPresent()) {
            StudentCourse sc = existingOpt.get();
            if (sc.getStatus() == EnrollmentStatus.ENROLLED) {
                throw new BadRequestException("You are already enrolled in this course.");
            }
            sc.setStatus(EnrollmentStatus.ENROLLED);
            sc.setEnrolledOn(LocalDateTime.now());
            studentCourseRepository.save(sc);
            return;
        }

        StudentCourse sc = new StudentCourse(student, course, EnrollmentStatus.ENROLLED);
        studentCourseRepository.save(sc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAttendanceSummary(String studentEmail) {
        StudentProfile student = getStudentByEmail(studentEmail);
        List<StudentCourse> list = studentCourseRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.ENROLLED);

        List<Map<String, Object>> result = new ArrayList<>();
        for (StudentCourse sc : list) {
            List<StudentAttendance> attList = studentAttendanceRepository.findByStudentCourseId(sc.getId());

            long present = 0;
            long absent = 0;
            long leave = 0;
            long holiday = 0;
            long workingDays = 0;

            for (StudentAttendance sa : attList) {
                if (sa.getStatus() == AttendanceStatus.PRESENT) {
                    present++;
                    workingDays++;
                } else if (sa.getStatus() == AttendanceStatus.ABSENT) {
                    absent++;
                    workingDays++;
                } else if (sa.getStatus() == AttendanceStatus.LEAVE) {
                    leave++;
                    workingDays++;
                } else if (sa.getStatus() == AttendanceStatus.HOLIDAY) {
                    holiday++;
                }
            }

            double percentage = workingDays > 0 ? (Math.round(((double) present / workingDays) * 1000.0) / 10.0) : 0.0;

            Map<String, Object> map = new HashMap<>();
            map.put("courseId", sc.getCourse().getId());
            map.put("courseName", sc.getCourse().getCourseName());
            map.put("courseCode", sc.getCourse().getCourseCode());
            map.put("present", present);
            map.put("absent", absent);
            map.put("leave", leave);
            map.put("holiday", holiday);
            map.put("totalClasses", workingDays);
            map.put("attendancePercentage", percentage);

            result.add(map);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlyAttendanceDetail(String studentEmail, int year, int month) {
        StudentProfile student = getStudentByEmail(studentEmail);
        YearMonth ym = YearMonth.of(year, month);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<StudentCourse> enrolled = studentCourseRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.ENROLLED);
        List<Map<String, Object>> monthlyRecords = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            DayOfWeek dow = date.getDayOfWeek();
            boolean isWeekend = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
            Optional<Holiday> holidayOpt = holidayRepository.findByDate(date);

            for (StudentCourse sc : enrolled) {
                Optional<StudentAttendance> attOpt = studentAttendanceRepository.findByStudentCourseIdAndClassDate(sc.getId(), date);

                Map<String, Object> record = new HashMap<>();
                record.put("date", date.toString());
                record.put("dayOfWeek", dow.name());
                record.put("courseName", sc.getCourse().getCourseName());
                record.put("courseCode", sc.getCourse().getCourseCode());

                if (isWeekend) {
                    // Sat/Sun automatically show as HOLIDAY (H), never ABSENT/blank
                    record.put("status", "HOLIDAY");
                    record.put("statusCode", "H");
                    record.put("remarks", "Weekend Holiday");
                } else if (holidayOpt.isPresent()) {
                    record.put("status", "HOLIDAY");
                    record.put("statusCode", "H");
                    record.put("remarks", holidayOpt.get().getName() + " (Holiday)");
                } else if (attOpt.isPresent()) {
                    StudentAttendance sa = attOpt.get();
                    record.put("status", sa.getStatus().name());
                    record.put("statusCode", sa.getStatus().name().substring(0, 1));
                    record.put("remarks", sa.getRemarks());
                } else {
                    record.put("status", "NOT_MARKED");
                    record.put("statusCode", "-");
                    record.put("remarks", "No class marked");
                }
                monthlyRecords.add(record);
            }
        }
        return monthlyRecords;
    }

    private static class ScheduleSlot {
        String courseCode;
        String courseName;
        String day;
        String timeSlot;
        String roomNo;
        String facultyName;

        ScheduleSlot(String courseCode, String courseName, String day, String timeSlot, String roomNo, String facultyName) {
            this.courseCode = courseCode;
            this.courseName = courseName;
            this.day = day;
            this.timeSlot = timeSlot;
            this.roomNo = roomNo;
            this.facultyName = facultyName;
        }
    }

    private static final List<ScheduleSlot> MASTER_SCHEDULE = List.of(
        new ScheduleSlot("CS301", "Database Management Systems", "MONDAY", "09:00 - 10:00", "Room 301", "Dr. Anjali Sharma"),
        new ScheduleSlot("CS301", "Database Management Systems", "WEDNESDAY", "09:00 - 10:00", "Room 301", "Dr. Anjali Sharma"),
        new ScheduleSlot("CS301", "Database Management Systems", "FRIDAY", "09:00 - 10:00", "Room 301", "Dr. Anjali Sharma"),

        new ScheduleSlot("CS302", "Operating Systems", "TUESDAY", "09:00 - 10:00", "Room 302", "Prof. Rohit Verma"),
        new ScheduleSlot("CS302", "Operating Systems", "THURSDAY", "09:00 - 10:00", "Room 302", "Prof. Rohit Verma"),
        new ScheduleSlot("CS302", "Operating Systems", "MONDAY", "10:00 - 11:00", "Room 302", "Prof. Rohit Verma"),

        new ScheduleSlot("CS201", "Data Structures & Algorithms", "MONDAY", "10:00 - 11:00", "Room 201", "Dr. Neha Gupta"),
        new ScheduleSlot("CS201", "Data Structures & Algorithms", "WEDNESDAY", "10:00 - 11:00", "Room 201", "Dr. Neha Gupta"),
        new ScheduleSlot("CS201", "Data Structures & Algorithms", "FRIDAY", "10:00 - 11:00", "Room 201", "Dr. Neha Gupta"),

        new ScheduleSlot("CS203", "Java Programming", "TUESDAY", "10:00 - 11:00", "Room 203", "Dr. Neha Gupta"),
        new ScheduleSlot("CS203", "Java Programming", "THURSDAY", "10:00 - 11:00", "Room 203", "Dr. Neha Gupta"),

        new ScheduleSlot("EC201", "Digital Electronics", "MONDAY", "11:15 - 12:15", "Room 204", "Dr. Kavita Singh"),
        new ScheduleSlot("EC201", "Digital Electronics", "WEDNESDAY", "11:15 - 12:15", "Room 204", "Dr. Kavita Singh"),

        new ScheduleSlot("ME201", "Thermodynamics", "TUESDAY", "11:15 - 12:15", "Room 205", "Prof. Amit Patel"),
        new ScheduleSlot("ME201", "Thermodynamics", "THURSDAY", "11:15 - 12:15", "Room 205", "Prof. Amit Patel"),

        new ScheduleSlot("CS303", "Computer Networks", "TUESDAY", "11:15 - 12:15", "Room 303", "Prof. Rohit Verma"),
        new ScheduleSlot("CS303", "Computer Networks", "THURSDAY", "11:15 - 12:15", "Room 303", "Prof. Rohit Verma")
    );

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTimetable(String studentEmail) {
        StudentProfile student = getStudentByEmail(studentEmail);
        List<StudentCourse> enrolled = studentCourseRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.ENROLLED);

        List<Map<String, Object>> timetable = new ArrayList<>();

        if (enrolled.isEmpty()) {
            return timetable;
        }

        Set<String> enrolledCodes = enrolled.stream()
            .map(sc -> sc.getCourse().getCourseCode())
            .collect(Collectors.toSet());

        for (ScheduleSlot s : MASTER_SCHEDULE) {
            if (enrolledCodes.contains(s.courseCode)) {
                Map<String, Object> cell = new HashMap<>();
                cell.put("day", s.day);
                cell.put("timeSlot", s.timeSlot);
                cell.put("courseCode", s.courseCode);
                cell.put("courseName", s.courseName);
                cell.put("facultyName", s.facultyName);
                cell.put("roomNo", s.roomNo);
                timetable.add(cell);
            }
        }

        return timetable;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyCourseFaculties(String studentEmail) {
        StudentProfile student = getStudentByEmail(studentEmail);
        List<StudentCourse> enrolled = studentCourseRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.ENROLLED);

        List<Map<String, Object>> list = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (StudentCourse sc : enrolled) {
            List<FacultyCourse> fcs = facultyCourseRepository.findByCourseId(sc.getCourse().getId());
            for (FacultyCourse fc : fcs) {
                FacultyProfile fp = fc.getFaculty();
                String key = fp.getId() + "_" + sc.getCourse().getId();
                if (!seen.contains(key)) {
                    seen.add(key);
                    Map<String, Object> map = new HashMap<>();
                    map.put("facultyId", fp.getId());
                    map.put("employeeId", fp.getEmployeeId());
                    map.put("name", fp.getFirstName() + " " + fp.getLastName());
                    map.put("department", fp.getDepartment());
                    map.put("designation", fp.getDesignation());
                    map.put("phone", fp.getPhone());
                    map.put("email", fp.getUser().getEmail());
                    map.put("courseName", sc.getCourse().getCourseName());
                    map.put("courseCode", sc.getCourse().getCourseCode());
                    list.add(map);
                }
            }
        }
        return list;
    }
}
