package com.college.cms.service.impl;

import com.college.cms.dto.MarkAttendanceRequest;
import com.college.cms.dto.MarkOwnAttendanceRequest;
import com.college.cms.dto.StudentAttendanceItem;
import com.college.cms.entity.*;
import com.college.cms.exception.BadRequestException;
import com.college.cms.exception.ForbiddenException;
import com.college.cms.exception.ResourceNotFoundException;
import com.college.cms.repository.*;
import com.college.cms.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class FacultyServiceImpl implements FacultyService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private FacultyCourseRepository facultyCourseRepository;

    @Autowired
    private StudentCourseRepository studentCourseRepository;

    @Autowired
    private StudentAttendanceRepository studentAttendanceRepository;

    @Autowired
    private FacultyAttendanceRepository facultyAttendanceRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    private FacultyProfile getFacultyByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        if (user.getFacultyProfile() == null) {
            throw new ResourceNotFoundException("Faculty profile not found for user: " + email);
        }
        return user.getFacultyProfile();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getFacultyDashboard(String facultyEmail) {
        FacultyProfile faculty = getFacultyByEmail(facultyEmail);
        List<FacultyCourse> fcs = facultyCourseRepository.findByFacultyId(faculty.getId());

        Set<Long> uniqueStudentIds = new HashSet<>();
        List<Map<String, Object>> pendingList = new ArrayList<>();
        LocalDate today = LocalDate.now();
        boolean isWeekend = (today.getDayOfWeek() == DayOfWeek.SATURDAY || today.getDayOfWeek() == DayOfWeek.SUNDAY);
        Optional<Holiday> holidayOpt = holidayRepository.findByDate(today);
        boolean isHoliday = isWeekend || holidayOpt.isPresent();
        String holidayName = isWeekend ? "Weekend (Holiday)" : (holidayOpt.isPresent() ? holidayOpt.get().getName() + " (Holiday)" : null);

        for (FacultyCourse fc : fcs) {
            Course c = fc.getCourse();
            List<StudentCourse> scs = studentCourseRepository.findByCourseIdAndStatus(c.getId(), EnrollmentStatus.ENROLLED);
            for (StudentCourse sc : scs) {
                uniqueStudentIds.add(sc.getStudent().getId());
            }

            // Check if attendance is pending for today (only on working days)
            if (!isHoliday && !scs.isEmpty()) {
                StudentCourse firstSc = scs.get(0);
                boolean isMarked = studentAttendanceRepository.existsByStudentCourseIdAndClassDate(firstSc.getId(), today);
                if (!isMarked) {
                    Map<String, Object> pMap = new HashMap<>();
                    pMap.put("courseId", c.getId());
                    pMap.put("courseName", c.getCourseName());
                    pMap.put("courseCode", c.getCourseCode());
                    pMap.put("enrolledCount", scs.size());
                    pendingList.add(pMap);
                }
            }
        }

        // Own attendance for today
        Optional<FacultyAttendance> ownAttOpt = facultyAttendanceRepository.findByFacultyIdAndAttendanceDate(faculty.getId(), today);
        String todayOwnStatus = ownAttOpt.map(fa -> fa.getStatus().name()).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("facultyName", faculty.getFirstName() + " " + faculty.getLastName());
        response.put("employeeId", faculty.getEmployeeId());
        response.put("department", faculty.getDepartment());
        response.put("designation", faculty.getDesignation());
        response.put("coursesCount", fcs.size());
        response.put("totalStudents", uniqueStudentIds.size());
        response.put("pendingAttendance", pendingList);
        response.put("todayDate", today.toString());
        response.put("isWeekend", isWeekend);
        response.put("isHoliday", isHoliday);
        response.put("holidayName", holidayName);
        response.put("todayOwnAttendance", todayOwnStatus);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyCourses(String facultyEmail) {
        FacultyProfile faculty = getFacultyByEmail(facultyEmail);
        List<FacultyCourse> fcs = facultyCourseRepository.findByFacultyId(faculty.getId());

        return fcs.stream().map(fc -> {
            Course c = fc.getCourse();
            long enrolledCount = studentCourseRepository.countEnrolledStudentsInCourse(c.getId());
            Map<String, Object> map = new HashMap<>();
            map.put("courseId", c.getId());
            map.put("courseName", c.getCourseName());
            map.put("courseCode", c.getCourseCode());
            map.put("credits", c.getCredits());
            map.put("department", c.getDepartment());
            map.put("semester", c.getSemester());
            map.put("description", c.getDescription());
            map.put("enrolledStudentsCount", enrolledCount);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentsInMyCourses(String facultyEmail) {
        FacultyProfile faculty = getFacultyByEmail(facultyEmail);
        List<FacultyCourse> fcs = facultyCourseRepository.findByFacultyId(faculty.getId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (FacultyCourse fc : fcs) {
            Course c = fc.getCourse();
            List<StudentCourse> scs = studentCourseRepository.findByCourseIdAndStatus(c.getId(), EnrollmentStatus.ENROLLED);

            for (StudentCourse sc : scs) {
                StudentProfile student = sc.getStudent();
                List<StudentAttendance> attList = studentAttendanceRepository.findByStudentCourseId(sc.getId());

                long present = 0;
                long totalWorking = 0;
                for (StudentAttendance sa : attList) {
                    if (sa.getStatus() == AttendanceStatus.PRESENT) {
                        present++;
                        totalWorking++;
                    } else if (sa.getStatus() == AttendanceStatus.ABSENT || sa.getStatus() == AttendanceStatus.LEAVE) {
                        totalWorking++;
                    }
                }

                double percentage = totalWorking > 0 ? (Math.round(((double) present / totalWorking) * 1000.0) / 10.0) : 0.0;

                Map<String, Object> map = new HashMap<>();
                map.put("studentId", student.getId());
                map.put("rollNo", student.getRollNo());
                map.put("name", student.getFirstName() + " " + student.getLastName());
                map.put("department", student.getDepartment());
                map.put("semester", student.getSemester());
                map.put("courseId", c.getId());
                map.put("courseName", c.getCourseName());
                map.put("courseCode", c.getCourseCode());
                map.put("attendancePercentage", percentage);

                result.add(map);
            }
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentsForAttendance(String facultyEmail, Long courseId, LocalDate date) {
        FacultyProfile faculty = getFacultyByEmail(facultyEmail);

        // Business Rule 2: Faculty can mark student attendance ONLY for courses assigned to them, else 403
        if (!facultyCourseRepository.existsByFacultyIdAndCourseId(faculty.getId(), courseId)) {
            throw new ForbiddenException("You are not assigned to teach this course.");
        }

        List<StudentCourse> scs = studentCourseRepository.findByCourseIdAndStatus(courseId, EnrollmentStatus.ENROLLED);
        List<Map<String, Object>> students = new ArrayList<>();

        for (StudentCourse sc : scs) {
            StudentProfile sp = sc.getStudent();
            Optional<StudentAttendance> existing = studentAttendanceRepository.findByStudentCourseIdAndClassDate(sc.getId(), date);

            Map<String, Object> map = new HashMap<>();
            map.put("studentId", sp.getId());
            map.put("studentCourseId", sc.getId());
            map.put("rollNo", sp.getRollNo());
            map.put("name", sp.getFirstName() + " " + sp.getLastName());
            map.put("status", existing.map(sa -> sa.getStatus().name()).orElse("PRESENT"));
            map.put("remarks", existing.map(StudentAttendance::getRemarks).orElse(""));

            students.add(map);
        }

        return students;
    }

    @Override
    public Map<String, Object> markStudentsAttendance(String facultyEmail, MarkAttendanceRequest request) {
        FacultyProfile faculty = getFacultyByEmail(facultyEmail);

        // Business Rule 1: Sat-Sun are automatically holidays. No attendance can be marked on Sat/Sun.
        if (request.getClassDate().getDayOfWeek() == DayOfWeek.SATURDAY || 
            request.getClassDate().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new BadRequestException("Attendance cannot be marked on weekends (Saturday/Sunday).");
        }

        if (holidayRepository.existsByDate(request.getClassDate())) {
            Holiday h = holidayRepository.findByDate(request.getClassDate()).orElse(null);
            String hName = h != null ? h.getName() : "Holiday";
            throw new BadRequestException("Attendance cannot be marked on " + hName + " (holiday).");
        }

        // Business Rule 2: Faculty can mark student attendance ONLY for courses assigned to them, else 403.
        if (!facultyCourseRepository.existsByFacultyIdAndCourseId(faculty.getId(), request.getCourseId())) {
            throw new ForbiddenException("You are not assigned to teach this course.");
        }

        int count = 0;
        for (StudentAttendanceItem item : request.getRecords()) {
            // Business Rule 3: Student can have attendance ONLY for an enrolled course, else 400.
            StudentCourse sc = studentCourseRepository.findByStudentIdAndCourseId(item.getStudentId(), request.getCourseId())
                .orElseThrow(() -> new BadRequestException("Student (ID " + item.getStudentId() + ") is not enrolled in this course."));

            if (sc.getStatus() != EnrollmentStatus.ENROLLED) {
                throw new BadRequestException("Student (ID " + item.getStudentId() + ") is dropped from this course.");
            }

            AttendanceStatus status;
            try {
                status = AttendanceStatus.valueOf(item.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid attendance status: " + item.getStatus());
            }

            // Business Rule 4: One attendance record per student/course/date — duplicate mark updates the same record.
            Optional<StudentAttendance> existing = studentAttendanceRepository.findByStudentCourseIdAndClassDate(sc.getId(), request.getClassDate());
            if (existing.isPresent()) {
                StudentAttendance sa = existing.get();
                sa.setStatus(status);
                sa.setMarkedByFaculty(faculty);
                sa.setRemarks(item.getRemarks());
                studentAttendanceRepository.save(sa);
            } else {
                StudentAttendance sa = new StudentAttendance(sc, request.getClassDate(), status, faculty, item.getRemarks());
                studentAttendanceRepository.save(sa);
            }
            count++;
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("count", count);
        res.put("message", "Attendance saved for " + count + " students");
        return res;
    }

    @Override
    public void markOwnAttendance(String facultyEmail, MarkOwnAttendanceRequest request) {
        FacultyProfile faculty = getFacultyByEmail(facultyEmail);

        // Business Rule 1: Sat-Sun are automatically holidays.
        if (request.getAttendanceDate().getDayOfWeek() == DayOfWeek.SATURDAY || 
            request.getAttendanceDate().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new BadRequestException("Attendance cannot be marked on weekends (Saturday/Sunday).");
        }

        if (holidayRepository.existsByDate(request.getAttendanceDate())) {
            Holiday h = holidayRepository.findByDate(request.getAttendanceDate()).orElse(null);
            String hName = h != null ? h.getName() : "Holiday";
            throw new BadRequestException("Attendance cannot be marked on " + hName + " (holiday).");
        }

        AttendanceStatus status;
        try {
            status = AttendanceStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.getStatus());
        }

        // Duplicate mark updates same record
        Optional<FacultyAttendance> existing = facultyAttendanceRepository.findByFacultyIdAndAttendanceDate(faculty.getId(), request.getAttendanceDate());
        if (existing.isPresent()) {
            FacultyAttendance fa = existing.get();
            fa.setStatus(status);
            facultyAttendanceRepository.save(fa);
        } else {
            FacultyAttendance fa = new FacultyAttendance(faculty, request.getAttendanceDate(), status);
            facultyAttendanceRepository.save(fa);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCourseAttendanceReport(String facultyEmail, Long courseId, LocalDate fromDate, LocalDate toDate) {
        FacultyProfile faculty = getFacultyByEmail(facultyEmail);

        if (!facultyCourseRepository.existsByFacultyIdAndCourseId(faculty.getId(), courseId)) {
            throw new ForbiddenException("You are not assigned to teach this course.");
        }

        if (fromDate == null) fromDate = LocalDate.now().minusDays(30);
        if (toDate == null) toDate = LocalDate.now();

        List<StudentCourse> scs = studentCourseRepository.findByCourseIdAndStatus(courseId, EnrollmentStatus.ENROLLED);
        List<Map<String, Object>> report = new ArrayList<>();

        for (StudentCourse sc : scs) {
            StudentProfile sp = sc.getStudent();
            List<StudentAttendance> attList = studentAttendanceRepository.findByStudentCourseIdAndDateRange(sc.getId(), fromDate, toDate);

            long present = 0;
            long absent = 0;
            long leave = 0;
            long totalWorking = 0;

            for (StudentAttendance sa : attList) {
                if (sa.getStatus() == AttendanceStatus.PRESENT) {
                    present++;
                    totalWorking++;
                } else if (sa.getStatus() == AttendanceStatus.ABSENT) {
                    absent++;
                    totalWorking++;
                } else if (sa.getStatus() == AttendanceStatus.LEAVE) {
                    leave++;
                    totalWorking++;
                }
            }

            double percentage = totalWorking > 0 ? (Math.round(((double) present / totalWorking) * 1000.0) / 10.0) : 0.0;

            Map<String, Object> map = new HashMap<>();
            map.put("studentId", sp.getId());
            map.put("rollNo", sp.getRollNo());
            map.put("name", sp.getFirstName() + " " + sp.getLastName());
            map.put("presentCount", present);
            map.put("absentCount", absent);
            map.put("leaveCount", leave);
            map.put("totalDays", totalWorking);
            map.put("attendancePercentage", percentage);

            report.add(map);
        }
        return report;
    }
}
