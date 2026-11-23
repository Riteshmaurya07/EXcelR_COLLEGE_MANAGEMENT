# Sunrise Institute of Technology — College Management System (CMS)

A production-ready, full-stack College Management System tailored for an Indian technical institute, built using Java 21, Spring Boot 3.3+, Spring Data JPA, Spring Security, MySQL 8/9.5, and React 19 + Bootstrap 5.

---

## 1. System Architecture & Tech Stack

- **Backend**:
  - Java 21 (LTS)
  - Spring Boot 3.3.5
  - Spring Data JPA + Hibernate
  - Spring Security (Stateless JWT authentication + Google OAuth2.0 Client + BCrypt password hashing)
  - Spring Mail (`spring-boot-starter-mail`) for password reset emails with fallback console logging
  - MySQL 8 / 9.5
  - Maven (`pom.xml`, importable directly as Existing Maven Project in Eclipse IDE 2026 + STS 5.0)
- **Frontend**:
  - React 19 (JavaScript, ES Modules, NOT TypeScript)
  - Vite
  - React Router DOM v7
  - Axios (with authorization bearer interceptor and 401 redirect handlers)
  - Bootstrap 5 ONLY (strict clean corporate palette: Dark Navy `#0F2A44`, White `#FFFFFF`, Page `#F4F6F8`, Green `#1B7A3D`, Amber `#B7791F`, Red `#B42318`)
- **API Testing**:
  - Postman Collection in `postman/college-cms.postman_collection.json` with environment variables `{{baseUrl}}` and `{{jwtToken}}`.

---

## 2. Database Setup (MySQL 8 / 9.5)

The system automatically initializes and migrates exactly the 10 relational tables:
1. `users`
2. `student_profiles`
3. `faculty_profiles`
4. `courses`
5. `student_courses`
6. `faculty_courses`
7. `student_attendance`
8. `faculty_attendance`
9. `academic_sessions`
10. `password_reset_tokens`

### Create Database & User
Run the following SQL commands in MySQL CLI or MySQL Workbench with your own strong password:

```sql
CREATE DATABASE IF NOT EXISTS college_cms;
CREATE USER IF NOT EXISTS 'cms_user'@'localhost' IDENTIFIED BY '<YOUR_STRONG_PASSWORD>';
GRANT ALL PRIVILEGES ON college_cms.* TO 'cms_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Run Locally

### Environment Variables & Fail-Fast Startup
All sensitive keys and passwords **MUST** be supplied via environment variables. The backend contains an automated fail-fast check: if `DB_PASSWORD` or `APP_JWT_SECRET` is missing or blank, the backend aborts startup immediately with a clear error:
`"Missing required env var DB_PASSWORD / APP_JWT_SECRET — see README"`.

All `.env` files are strictly gitignored and never committed or pushed to GitHub.

### Step 1: Run Backend (Windows PowerShell)
```powershell
# Set mandatory environment variables
$env:DB_USERNAME="cms_user"
$env:DB_PASSWORD="<YOUR_STRONG_PASSWORD>"
$env:APP_JWT_SECRET="<YOUR_MIN_64_CHAR_RANDOM_SECRET>"

# Optional integrations (defaults are preconfigured for local dev)
# $env:GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
# $env:GOOGLE_CLIENT_SECRET="your-client-secret"
# $env:MAIL_HOST="smtp.gmail.com"
# $env:MAIL_PORT="587"
# $env:MAIL_USERNAME="notifications@college.edu"
# $env:MAIL_PASSWORD="your-smtp-app-password"

cd backend
.\mvnw.cmd spring-boot:run
```
The backend server starts on `http://localhost:8080`.

### Step 2: Run Frontend (Windows PowerShell)
```powershell
cd frontend
npm install
npm run dev
```
The frontend application starts on `http://localhost:5173`.

---

## 4. Backend Configuration (`backend/src/main/resources/application.properties`)

```properties
spring.application.name=college-management-system
server.port=8080

# Database Configuration (No real passwords in code)
spring.datasource.url=jdbc:mysql://localhost:3306/college_cms?useSSL=false&serverTimezone=IST&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.username=${DB_USERNAME:cms_user}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA & Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Configuration
app.jwt.secret=${APP_JWT_SECRET:}
app.jwt.expiration-ms=86400000

# Google OAuth2.0 Configuration
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:YOUR_GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:YOUR_GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}

# Spring Mail SMTP Settings
spring.mail.host=${MAIL_HOST:localhost}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Dynamic Origins & Institutional Metadata
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}
app.frontend.url=${FRONTEND_URL:http://localhost:5173}
app.college.name=${COLLEGE_NAME:Sunrise Institute of Technology}
app.college.established-year=${COLLEGE_ESTD:2010}
```

### Google OAuth2.0 Setup Steps (Google Cloud Console)
To enable real Google Sign-In with Google's account chooser:
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing project.
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - Choose **External** user type.
   - Enter App name (e.g., `Sunrise College CMS`) and developer contact email.
   - Add scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`.
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Select Application type: **Web application**.
   - Add Authorized JavaScript origins: `http://localhost:5173` and `http://localhost:8080`.
   - Add Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`.
5. Copy your **Client ID** and **Client Secret** into your local environment variables.
> **Note**: If `GOOGLE_CLIENT_ID` is not set or remains the placeholder `YOUR_GOOGLE_CLIENT_ID`, the frontend automatically detects this via `GET /api/auth/oauth-config` and **hides the Google Sign-In button completely**, ensuring only functional login methods are visible.

---

## 5. Demo Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@college.edu` | (see local .env / ask admin) | Sunrise Admin — System stats, student roster, faculty assignments, session & holiday calendars |
| **Faculty** | `anjali.sharma@college.edu` | (see local .env / ask admin) | Dr. Anjali Sharma (HOD & Professor, CSE), instructor for CS301 |
| **Student** | `aarav.sharma@student.college.edu` | (see local .env / ask admin) | Aarav Sharma (CSE-2023-001, Semester 5, CSE) |

---

## 6. Business Rules Enforced in Service Layer

1. **Weekend & Statutory Holidays**:
   - Saturdays and Sundays are automatically non-working holidays.
   - Custom holidays (e.g. Guru Nanak Jayanti, Christmas, state holidays) declared by the Admin in the College Calendar are also enforced.
   - Any attempt to mark student or faculty attendance on Saturday, Sunday, or a declared holiday is rejected with HTTP `400 Bad Request` ("Attendance cannot be marked on <Holiday Name> (holiday).").
   - In monthly reports and timetables, weekends and declared holidays display with status `HOLIDAY` (`H`) with the holiday name in remarks.
2. **Faculty Course Authorization**:
   - Faculty can mark attendance only for subjects assigned to them in `faculty_courses`. Attempting to mark attendance for unassigned subjects throws HTTP `403 Forbidden`.
3. **Department & Semester Enrolment Rule**:
   - A student can enrol ONLY in courses matching their department and semester.
   - Cross-department enrollment is blocked with HTTP `400 Bad Request` unless explicitly flagged as an `openElective`.
4. **Duplicate Attendance Idempotency**:
   - Marking attendance for a student/course/date that already exists updates the existing record rather than creating a duplicate.
5. **Fixed Schedule Timetable**:
   - Fixed per-course master schedule prevents room and faculty collision:
     - `CS301 DBMS` — Mon, Wed, Fri 09:00–10:00, Room 301, Dr. Anjali Sharma
     - `CS302 OS` — Tue, Thu 09:00–10:00 + Mon 10:00–11:00, Room 302, Prof. Rohit Verma
     - `CS303 Computer Networks` — Tue, Thu 11:15–12:15, Room 303, Prof. Rohit Verma
     - `CS201 Data Structures` — Mon, Wed, Fri 10:00–11:00, Room 201, Dr. Neha Gupta
     - `CS203 Java Programming` — Tue, Thu 10:00–11:00, Room 203, Dr. Neha Gupta
     - `EC201 Digital Electronics` — Mon, Wed 11:15–12:15, Room 204, Dr. Kavita Singh
     - `ME201 Thermodynamics` — Tue, Thu 11:15–12:15, Room 205, Prof. Amit Patel
6. **Separation of Faculty & Student Attendance**:
   - Faculty record their daily personal attendance via `POST /api/faculty/attendance/mark-own`.
   - Administrators view student and faculty attendance separately and can mark faculty attendance via `POST /api/admin/faculty-attendance/mark`.
7. **Single Active Academic Session**:
   - Only one academic session can have `is_current = true`. Activating any session automatically deactivates all others.
8. **Strict Validation & Clear Error Codes**:
   - Duplicate emails, roll numbers, employee IDs, and course codes return HTTP `400 Bad Request` with human-readable error messages. Never returns 500 for validation errors.

---

## 7. Application Routes

| Category | Route | Description |
|---|---|---|
| **Public** | `/` | Home page with institute intro, real live counts, and portal links |
| **Public** | `/login` | Common login for Admin, Faculty, Student with OAuth2 detection |
| **Public** | `/register` | Student registration (backend enforces `STUDENT` role) |
| **Public** | `/forgot-password` | Password reset request with 30-minute single-use token generation |
| **Public** | `/reset-password` | Password reset confirmation with token validation |
| **Public** | `/complete-profile` | Onboarding flow for Google OAuth users to select department and semester |
| **Admin** | `/admin/dashboard` | Key metrics, Today's Attendance %, active session badge, low attendance alerts (<75%), dept breakdown |
| **Admin** | `/admin/students` | Searchable student table, enrollment status, registration modal |
| **Admin** | `/admin/faculties` | Faculty roster, add faculty/admin modal, status toggle |
| **Admin** | `/admin/courses` | Curriculum catalog, add course, edit course modal, delete empty course, unassign faculty |
| **Admin** | `/admin/reports` | Dual-tab attendance reports + Admin faculty attendance marking |
| **Admin** | `/admin/sessions` | Academic sessions management + College calendar statutory holidays |
| **Student** | `/student/dashboard` | Enrolled courses count, overall attendance progress bar, today's classes |
| **Student** | `/student/courses` | Available courses catalogue with department/semester enforcement + enrolled courses |
| **Student** | `/student/attendance` | Per-course percentage table + monthly day-by-day register with 'H' holiday badges |
| **Student** | `/student/timetable` | Monday–Friday fixed master schedule grid with room numbers |
| **Student** | `/student/faculties` | Instructors teaching enrolled subjects |
| **Faculty** | `/faculty/dashboard` | Assigned courses count, enrolled students, own attendance card |
| **Faculty** | `/faculty/courses` | My assigned subjects and student enrollment counts |
| **Faculty** | `/faculty/students` | Course-grouped student roster with subject-specific percentages |
| **Faculty** | `/faculty/attendance` | Course attendance register + integrated course reports |
| **Common** | `/profile` | Institutional profile (Admin / Faculty / Student) with phone/name editing & password change |

---

## 8. Postman Collection Usage

1. Open Postman and click **Import**.
2. Select `postman/college-cms.postman_collection.json`.
3. The collection is pre-configured with the variable `{{baseUrl}} = http://localhost:8080/api`.
4. Run the **Admin Login**, **Faculty Login**, or **Student Login** request. The test script automatically captures the returned JWT token and stores it in `{{jwtToken}}`.
5. All subsequent requests automatically inherit this token.
