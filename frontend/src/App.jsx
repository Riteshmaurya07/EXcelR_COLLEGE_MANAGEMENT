import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import CompleteProfile from './pages/public/CompleteProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminFaculties from './pages/admin/AdminFaculties';
import AdminCourses from './pages/admin/AdminCourses';
import AdminReports from './pages/admin/AdminReports';
import AdminSessions from './pages/admin/AdminSessions';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentFaculties from './pages/student/StudentFaculties';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyCourses from './pages/faculty/FacultyCourses';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyAttendance from './pages/faculty/FacultyAttendance';

// Common Page
import Profile from './pages/common/Profile';

// Unknown Route Handler: redirect to /login if logged out, else own dashboard
const UnknownRouteHandler = () => {
  const { isAuthenticated, getDashboardRoute } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDashboardRoute()} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (5) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          {/* Admin Routes (6) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculties"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminFaculties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSessions />
              </ProtectedRoute>
            }
          />

          {/* Student Routes (5) */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentAttendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentTimetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/faculties"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentFaculties />
              </ProtectedRoute>
            }
          />

          {/* Faculty Routes (4) */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/courses"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <FacultyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/students"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <FacultyStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty/attendance"
            element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <FacultyAttendance />
              </ProtectedRoute>
            }
          />

          {/* Common Route (1) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'STUDENT']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Unknown Route Catch-All */}
          <Route path="*" element={<UnknownRouteHandler />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
