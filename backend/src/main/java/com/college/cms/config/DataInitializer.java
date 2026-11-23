package com.college.cms.config;

import com.college.cms.entity.*;
import com.college.cms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

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
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Running startup migrations and backfills...");
            ensureCurrentSession();
            ensureAdminProfileInDb();
            ensureHolidaysSeeded();
            runDepartmentAndCourseMigration();
            backfillAttendanceUpToToday();
            return;
        }

        seedAll();
    }

    private void ensureCurrentSession() {
        Optional<AcademicSession> currentOpt = academicSessionRepository.findByIsCurrentTrue();
        if (currentOpt.isEmpty() || !currentOpt.get().getSessionName().contains("2026-27 Odd Semester")) {
            List<AcademicSession> allSessions = academicSessionRepository.findAll();
            for (AcademicSession s : allSessions) {
                s.setIsCurrent(false);
                academicSessionRepository.save(s);
            }
            AcademicSession session = new AcademicSession(
                "2026-27 Odd Semester",
                LocalDate.of(2026, 7, 1),
                LocalDate.of(2026, 12, 31),
                true
            );
            academicSessionRepository.save(session);
            logger.info("Activated current session: 2026-27 Odd Semester");
        }
    }

    private void ensureAdminProfileInDb() {
        Optional<User> adminOpt = userRepository.findByEmail("admin@college.edu");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            if (admin.getFirstName() == null || admin.getPhone() == null) {
                admin.setFirstName("Sunrise");
                admin.setLastName("Admin");
                admin.setPhone("+91 9876543200");
                userRepository.save(admin);
                logger.info("Updated Admin user profile fields in database.");
            }
        }
    }

    private void ensureHolidaysSeeded() {
        if (holidayRepository.count() == 0) {
            // Fix 6: Example holidays
            holidayRepository.save(new Holiday(LocalDate.of(2026, 11, 24), "Guru Nanak Jayanti", "System Initializer"));
            holidayRepository.save(new Holiday(LocalDate.of(2026, 12, 25), "Christmas", "System Initializer"));
            logger.info("Seeded default custom holidays in database.");
        }
    }

    private void runDepartmentAndCourseMigration() {
        // Fix 2: Ensure CS303 Computer Networks exists
        Course cs303 = courseRepository.findByCourseCode("CS303").orElseGet(() -> {
            Course c = new Course(
                "Computer Networks",
                "CS303",
                4,
                "CSE",
                5,
                "OSI/TCP-IP, routing, congestion control, DNS, HTTP, and network security."
            );
            return courseRepository.save(c);
        });

        // Ensure Prof. Rohit Verma is assigned to CS303
        Optional<FacultyProfile> rohitOpt = facultyProfileRepository.findByEmployeeId("FAC-CSE-002");
        if (rohitOpt.isPresent()) {
            FacultyProfile rohit = rohitOpt.get();
            if (!facultyCourseRepository.existsByFacultyIdAndCourseId(rohit.getId(), cs303.getId())) {
                facultyCourseRepository.save(new FacultyCourse(rohit, cs303));
            }
        }

        // 1. Remove CSE students from ME201 and delete their ME201 attendance
        Optional<Course> me201Opt = courseRepository.findByCourseCode("ME201");
        if (me201Opt.isPresent()) {
            Course me201 = me201Opt.get();
            List<StudentCourse> me201Enrollments = studentCourseRepository.findByCourseIdAndStatus(me201.getId(), EnrollmentStatus.ENROLLED);
            for (StudentCourse sc : me201Enrollments) {
                if ("CSE".equalsIgnoreCase(sc.getStudent().getDepartment())) {
                    // Delete student attendance records for ME201
                    List<StudentAttendance> atts = studentAttendanceRepository.findByStudentCourseId(sc.getId());
                    studentAttendanceRepository.deleteAll(atts);
                    studentCourseRepository.delete(sc);
                    logger.info("Removed invalid ME201 enrollment for CSE student: {}", sc.getStudent().getRollNo());
                }
            }
        }

        // 2. Ensure all CSE Sem 5 students are enrolled in CS303
        Optional<Course> cs301Opt = courseRepository.findByCourseCode("CS301");
        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        List<LocalDate> workingDays = getLastWorkingDays(15);
        Random random = new Random(42);

        FacultyProfile rohit = rohitOpt.orElse(null);

        for (StudentProfile st : allStudents) {
            if ("CSE".equalsIgnoreCase(st.getDepartment()) && st.getSemester() == 5) {
                Optional<StudentCourse> existingCs303 = studentCourseRepository.findByStudentIdAndCourseId(st.getId(), cs303.getId());
                if (existingCs303.isEmpty()) {
                    StudentCourse sc = new StudentCourse(st, cs303, EnrollmentStatus.ENROLLED);
                    sc.setEnrolledOn(LocalDateTime.of(2026, 7, 18, 10, 0));
                    StudentCourse savedSc = studentCourseRepository.save(sc);

                    // Seed realistic attendance for CS303
                    for (LocalDate date : workingDays) {
                        int roll = random.nextInt(100);
                        AttendanceStatus status = (roll < 82) ? AttendanceStatus.PRESENT : (roll < 95 ? AttendanceStatus.ABSENT : AttendanceStatus.LEAVE);
                        studentAttendanceRepository.save(new StudentAttendance(
                            savedSc,
                            date,
                            status,
                            rohit,
                            status == AttendanceStatus.PRESENT ? "Present" : (status == AttendanceStatus.LEAVE ? "Medical leave" : "Absent")
                        ));
                    }
                    logger.info("Enrolled CSE Sem 5 student {} in CS303", st.getRollNo());
                }
            } else if ("ME".equalsIgnoreCase(st.getDepartment()) && st.getSemester() == 5) {
                // Kunal Saxena (ME-2023-015): core ME201 + CS301 as Open Elective
                if (cs301Opt.isPresent()) {
                    Course cs301 = cs301Opt.get();
                    Optional<StudentCourse> electiveOpt = studentCourseRepository.findByStudentIdAndCourseId(st.getId(), cs301.getId());
                    if (electiveOpt.isEmpty()) {
                        StudentCourse sc = new StudentCourse(st, cs301, EnrollmentStatus.ENROLLED);
                        sc.setOpenElective(true); // Open elective for ME student
                        sc.setEnrolledOn(LocalDateTime.of(2026, 7, 19, 11, 30));
                        studentCourseRepository.save(sc);
                        logger.info("Enrolled ME Sem 5 student {} in CS301 as Open Elective", st.getRollNo());
                    }
                }
            }
        }
    }

    private void backfillAttendanceUpToToday() {
        // Fix 8: Ensure attendance for the last 15 working days ending on today (LocalDate.now())
        List<LocalDate> workingDays = getLastWorkingDays(15);
        List<StudentCourse> activeEnrollments = studentCourseRepository.findAll().stream()
            .filter(sc -> sc.getStatus() == EnrollmentStatus.ENROLLED)
            .toList();

        Random random = new Random(42);

        for (StudentCourse sc : activeEnrollments) {
            List<FacultyCourse> fcs = facultyCourseRepository.findByCourseId(sc.getCourse().getId());
            FacultyProfile faculty = fcs.isEmpty() ? null : fcs.get(0).getFaculty();

            for (LocalDate date : workingDays) {
                if (!studentAttendanceRepository.existsByStudentCourseIdAndClassDate(sc.getId(), date)) {
                    int roll = random.nextInt(100);
                    AttendanceStatus status = (roll < 82) ? AttendanceStatus.PRESENT : (roll < 95 ? AttendanceStatus.ABSENT : AttendanceStatus.LEAVE);
                    studentAttendanceRepository.save(new StudentAttendance(
                        sc,
                        date,
                        status,
                        faculty,
                        status == AttendanceStatus.PRESENT ? "Present" : (status == AttendanceStatus.LEAVE ? "Medical leave" : "Absent")
                    ));
                }
            }
        }

        List<FacultyProfile> facultyList = facultyProfileRepository.findAll();
        for (FacultyProfile fp : facultyList) {
            for (LocalDate date : workingDays) {
                if (!facultyAttendanceRepository.existsByFacultyIdAndAttendanceDate(fp.getId(), date)) {
                    int roll = random.nextInt(100);
                    AttendanceStatus status = (roll < 92) ? AttendanceStatus.PRESENT : (roll < 97 ? AttendanceStatus.LEAVE : AttendanceStatus.ABSENT);
                    facultyAttendanceRepository.save(new FacultyAttendance(fp, date, status));
                }
            }
        }
    }

    private List<LocalDate> getLastWorkingDays(int count) {
        List<LocalDate> workingDays = new ArrayList<>();
        LocalDate checkDate = LocalDate.now();
        while (workingDays.size() < count) {
            DayOfWeek dow = checkDate.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                workingDays.add(checkDate);
            }
            checkDate = checkDate.minusDays(1);
        }
        Collections.sort(workingDays);
        return workingDays;
    }

    public void seedAll() {
        logger.info("Seeding realistic college management system data for Sunrise Institute of Technology...");

        // 1. Academic Session
        AcademicSession session = new AcademicSession(
            "2026-27 Odd Semester",
            LocalDate.of(2026, 7, 1),
            LocalDate.of(2026, 12, 31),
            true
        );
        academicSessionRepository.save(session);

        // 2. Admin User with DB-stored profile details (Fix 10)
        User adminUser = new User("admin@college.edu", passwordEncoder.encode("Admin@123"), Role.ADMIN, UserStatus.ACTIVE);
        adminUser.setFirstName("Sunrise");
        adminUser.setLastName("Admin");
        adminUser.setPhone("+91 9876543200");
        userRepository.save(adminUser);

        // 3. Faculty Members (5)
        Object[][] facultyData = {
            {"anjali.sharma@college.edu", "Faculty@123", "FAC-CSE-001", "Dr. Anjali", "Sharma", "CSE", "Professor & HOD", "+91 9876543210"},
            {"rohit.verma@college.edu", "Faculty@123", "FAC-CSE-002", "Prof. Rohit", "Verma", "CSE", "Associate Professor", "+91 9876543211"},
            {"kavita.singh@college.edu", "Faculty@123", "FAC-ECE-001", "Dr. Kavita", "Singh", "ECE", "Professor", "+91 9876543212"},
            {"amit.patel@college.edu", "Faculty@123", "FAC-ME-001", "Prof. Amit", "Patel", "ME", "Assistant Professor", "+91 9876543213"},
            {"neha.gupta@college.edu", "Faculty@123", "FAC-CSE-003", "Dr. Neha", "Gupta", "CSE", "Associate Professor", "+91 9876543214"}
        };

        List<FacultyProfile> facultyList = new ArrayList<>();
        for (Object[] f : facultyData) {
            User u = new User((String) f[0], passwordEncoder.encode((String) f[1]), Role.FACULTY, UserStatus.ACTIVE);
            User savedU = userRepository.save(u);

            FacultyProfile fp = new FacultyProfile(
                savedU,
                (String) f[2],
                (String) f[3],
                (String) f[4],
                (String) f[5],
                (String) f[6],
                (String) f[7]
            );
            facultyList.add(facultyProfileRepository.save(fp));
            savedU.setFacultyProfile(fp);
        }

        // 4. Courses (7 total, including CS303 Computer Networks per Fix 2a)
        Object[][] courseData = {
            {"Data Structures & Algorithms", "CS201", 4, "CSE", 3, "Advanced linear and non-linear data structures, trees, graphs, and complexity analysis."},
            {"Database Management Systems", "CS301", 4, "CSE", 5, "Relational databases, SQL, normalization, indexing, transaction processing, and concurrency control."},
            {"Operating Systems", "CS302", 4, "CSE", 5, "Processes, threads, CPU scheduling, synchronization, memory management, and file systems."},
            {"Java Programming", "CS203", 3, "CSE", 3, "Object-oriented programming, exception handling, collections framework, multithreading, and JDBC."},
            {"Digital Electronics", "EC201", 4, "ECE", 3, "Boolean algebra, logic gates, combinational and sequential circuit design, and flip-flops."},
            {"Thermodynamics", "ME201", 4, "ME", 5, "Laws of thermodynamics, heat engines, entropy, pure substances, and vapor power cycles."},
            {"Computer Networks", "CS303", 4, "CSE", 5, "OSI/TCP-IP, routing, congestion control, DNS, HTTP, and network security."}
        };

        List<Course> courseList = new ArrayList<>();
        for (Object[] c : courseData) {
            Course course = new Course(
                (String) c[0],
                (String) c[1],
                (Integer) c[2],
                (String) c[3],
                (Integer) c[4],
                (String) c[5]
            );
            courseList.add(courseRepository.save(course));
        }

        // 5. Assign Courses to Faculty
        facultyCourseRepository.save(new FacultyCourse(facultyList.get(0), courseList.get(1))); // Anjali -> DBMS (CS301)
        facultyCourseRepository.save(new FacultyCourse(facultyList.get(1), courseList.get(2))); // Rohit -> OS (CS302)
        facultyCourseRepository.save(new FacultyCourse(facultyList.get(1), courseList.get(6))); // Rohit -> Computer Networks (CS303)
        facultyCourseRepository.save(new FacultyCourse(facultyList.get(4), courseList.get(0))); // Neha -> DS (CS201)
        facultyCourseRepository.save(new FacultyCourse(facultyList.get(4), courseList.get(3))); // Neha -> Java (CS203)
        facultyCourseRepository.save(new FacultyCourse(facultyList.get(2), courseList.get(4))); // Kavita -> Digital Elec (EC201)
        facultyCourseRepository.save(new FacultyCourse(facultyList.get(3), courseList.get(5))); // Amit -> Thermo (ME201)

        // 6. Students (19 total: 11 in Sem 5, 8 in Sem 3)
        Object[][] studentData = {
            {"aarav.sharma@student.college.edu", "Student@123", "CSE-2023-001", "Aarav", "Sharma", "CSE", 5, "+91 9811001101"},
            {"priya.verma@student.college.edu", "Student@123", "CSE-2023-002", "Priya", "Verma", "CSE", 5, "+91 9811001102"},
            {"rahul.yadav@student.college.edu", "Student@123", "CSE-2023-003", "Rahul", "Yadav", "CSE", 5, "+91 9811001103"},
            {"sneha.patel@student.college.edu", "Student@123", "CSE-2023-004", "Sneha", "Patel", "CSE", 5, "+91 9811001104"},
            {"arjun.singh@student.college.edu", "Student@123", "CSE-2023-005", "Arjun", "Singh", "CSE", 5, "+91 9811001105"},
            {"ishita.gupta@student.college.edu", "Student@123", "CSE-2023-006", "Ishita", "Gupta", "CSE", 5, "+91 9811001106"},
            {"rohan.nair@student.college.edu", "Student@123", "CSE-2023-007", "Rohan", "Nair", "CSE", 5, "+91 9811001107"},
            {"ananya.iyer@student.college.edu", "Student@123", "CSE-2023-008", "Ananya", "Iyer", "CSE", 5, "+91 9811001108"},
            {"aditya.joshi@student.college.edu", "Student@123", "CSE-2023-009", "Aditya", "Joshi", "CSE", 5, "+91 9811001109"},
            {"pooja.mishra@student.college.edu", "Student@123", "CSE-2023-010", "Pooja", "Mishra", "CSE", 5, "+91 9811001110"},
            {"kunal.saxena@student.college.edu", "Student@123", "ME-2023-015", "Kunal", "Saxena", "ME", 5, "+91 9811001115"},
            {"vikram.malhotra@student.college.edu", "Student@123", "CSE-2023-011", "Vikram", "Malhotra", "CSE", 3, "+91 9811001111"},
            {"tanvi.deshmukh@student.college.edu", "Student@123", "CSE-2023-012", "Tanvi", "Deshmukh", "CSE", 3, "+91 9811001112"},
            {"siddharth.roy@student.college.edu", "Student@123", "ECE-2023-013", "Siddharth", "Roy", "ECE", 3, "+91 9811001113"},
            {"meera.nambiar@student.college.edu", "Student@123", "ECE-2023-014", "Meera", "Nambiar", "ECE", 3, "+91 9811001114"},
            {"ritu.choudhury@student.college.edu", "Student@123", "ME-2023-016", "Ritu", "Choudhury", "ME", 3, "+91 9811001116"},
            {"devansh.trivedi@student.college.edu", "Student@123", "CE-2023-017", "Devansh", "Trivedi", "CE", 3, "+91 9811001117"},
            {"shreya.banerjee@student.college.edu", "Student@123", "EE-2023-018", "Shreya", "Banerjee", "EE", 3, "+91 9811001118"},
            {"manish.kumar@student.college.edu", "Student@123", "CSE-2023-019", "Manish", "Kumar", "CSE", 3, "+91 9811001119"}
        };

        List<StudentProfile> studentList = new ArrayList<>();
        for (Object[] s : studentData) {
            User u = new User((String) s[0], passwordEncoder.encode((String) s[1]), Role.STUDENT, UserStatus.ACTIVE);
            User savedU = userRepository.save(u);

            StudentProfile sp = new StudentProfile(
                savedU,
                (String) s[2],
                (String) s[3],
                (String) s[4],
                (String) s[5],
                (Integer) s[6],
                (String) s[7]
            );
            studentList.add(studentProfileRepository.save(sp));
            savedU.setStudentProfile(sp);
        }

        // 7. Enrol Students strictly adhering to department + semester rules (Fix 2b)
        List<StudentCourse> allStudentCourses = new ArrayList<>();
        int enrollDayOffset = 0;

        for (int i = 0; i < studentList.size(); i++) {
            StudentProfile st = studentList.get(i);
            int sem = st.getSemester();
            String dept = st.getDepartment();
            List<Course> toEnroll = new ArrayList<>();
            boolean isElective = false;

            if (sem == 5) {
                if ("CSE".equalsIgnoreCase(dept)) {
                    // CSE Sem 5: CS301 (DBMS), CS302 (OS), CS303 (Computer Networks) ONLY
                    toEnroll.add(courseList.get(1)); // CS301
                    toEnroll.add(courseList.get(2)); // CS302
                    toEnroll.add(courseList.get(6)); // CS303
                } else if ("ME".equalsIgnoreCase(dept)) {
                    // ME Sem 5 (Kunal): ME201 core + CS301 as Open Elective
                    toEnroll.add(courseList.get(5)); // ME201 core
                    toEnroll.add(courseList.get(1)); // CS301 open elective
                    isElective = true;
                }
            } else {
                // Sem 3 students
                toEnroll.add(courseList.get(0)); // CS201 DS (Sem 3)
                toEnroll.add(courseList.get(3)); // CS203 Java (Sem 3)
                if ("ECE".equalsIgnoreCase(dept) || i % 2 == 0) {
                    toEnroll.add(courseList.get(4)); // EC201 Digital Elec (Sem 3)
                }
            }

            for (Course c : toEnroll) {
                int day = 10 + (enrollDayOffset % 20);
                LocalDateTime enrolledDate = LocalDateTime.of(2026, 7, day, 9 + (enrollDayOffset % 8), 15 + (i * 2) % 45, 0);
                enrollDayOffset++;

                StudentCourse sc = new StudentCourse(st, c, EnrollmentStatus.ENROLLED);
                sc.setEnrolledOn(enrolledDate);
                if (isElective && c.getCourseCode().equals("CS301") && "ME".equalsIgnoreCase(dept)) {
                    sc.setOpenElective(true);
                }
                allStudentCourses.add(studentCourseRepository.save(sc));
            }
        }

        // 8. Generate Attendance for the last 15 working days ending on TODAY (LocalDate.now())
        List<LocalDate> workingDays = getLastWorkingDays(15);
        Random random = new Random(42);

        for (StudentCourse sc : allStudentCourses) {
            List<FacultyCourse> fcs = facultyCourseRepository.findByCourseId(sc.getCourse().getId());
            FacultyProfile faculty = fcs.isEmpty() ? facultyList.get(0) : fcs.get(0).getFaculty();

            for (LocalDate date : workingDays) {
                int roll = random.nextInt(100);
                AttendanceStatus status = (roll < 82) ? AttendanceStatus.PRESENT : (roll < 95 ? AttendanceStatus.ABSENT : AttendanceStatus.LEAVE);
                studentAttendanceRepository.save(new StudentAttendance(
                    sc,
                    date,
                    status,
                    faculty,
                    status == AttendanceStatus.PRESENT ? "Present" : (status == AttendanceStatus.LEAVE ? "Medical leave" : "Absent")
                ));
            }
        }

        // 9. Faculty Attendance for the last 15 working days
        for (FacultyProfile fp : facultyList) {
            for (LocalDate date : workingDays) {
                int roll = random.nextInt(100);
                AttendanceStatus status = (roll < 92) ? AttendanceStatus.PRESENT : (roll < 97 ? AttendanceStatus.LEAVE : AttendanceStatus.ABSENT);
                facultyAttendanceRepository.save(new FacultyAttendance(fp, date, status));
            }
        }

        // 10. Seed custom holidays
        ensureHolidaysSeeded();

        logger.info("Successfully seeded database with 1 Admin, 5 Faculty, 19 Students, 7 Courses, realistic enrollments, and 15 working days of attendance!");
    }
}
