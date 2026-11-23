import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    totalStudents: null,
    totalFaculty: null,
    totalCourses: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api.get('/public/stats')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch public stats', err);
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, []);

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      <Navbar />

      <main className="flex-grow-1 d-flex flex-column justify-content-center py-5">
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="text-center mb-5">
            <h1 className="fw-bold mb-2" style={{ color: 'var(--color-primary)', fontSize: '28px' }}>
              Sunrise Institute of Technology
            </h1>
            <p className="text-muted" style={{ fontSize: '16px' }}>
              College Management System for Students, Faculty and Admin
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Link to="/login" className="btn btn-primary px-4 py-2">
                Sign In to Portal
              </Link>
              <Link to="/register" className="btn btn-outline-primary px-4 py-2">
                New Student Registration
              </Link>
            </div>
          </div>

          {/* Real Live Stats from Database (Fix 4a) */}
          <div className="row g-3 mb-5 justify-content-center">
            <div className="col-6 col-md-3">
              <div className="card text-center p-3 border bg-light shadow-none">
                <div className="fw-bold text-primary fs-3">
                  {loadingStats ? '-' : (stats.totalStudents ?? 0)}
                </div>
                <div className="text-muted small fw-semibold">Enrolled Students</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center p-3 border bg-light shadow-none">
                <div className="fw-bold text-primary fs-3">
                  {loadingStats ? '-' : (stats.totalFaculty ?? 0)}
                </div>
                <div className="text-muted small fw-semibold">Faculty Members</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center p-3 border bg-light shadow-none">
                <div className="fw-bold text-primary fs-3">
                  {loadingStats ? '-' : (stats.totalCourses ?? 0)}
                </div>
                <div className="text-muted small fw-semibold">Active Courses</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card text-center p-3 border bg-light shadow-none">
                <div className="fw-bold text-primary fs-3">Est. 2010</div>
                <div className="text-muted small fw-semibold">Academic Excellence</div>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <div className="card h-100 border p-4 text-center">
                <h3 className="h5 fw-bold mb-2">Student Portal</h3>
                <p className="text-muted small mb-4">
                  Check course enrollments, track daily attendance percentages, view weekly timetables, and monitor course instructors.
                </p>
                <div className="mt-auto">
                  <Link to="/login" className="btn btn-outline-primary btn-sm w-100">
                    Student Login
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border p-4 text-center">
                <h3 className="h5 fw-bold mb-2">Faculty Portal</h3>
                <p className="text-muted small mb-4">
                  Manage assigned subjects, record daily student attendance, inspect course-wise rosters, and mark personal attendance.
                </p>
                <div className="mt-auto">
                  <Link to="/login" className="btn btn-outline-primary btn-sm w-100">
                    Faculty Login
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border p-4 text-center">
                <h3 className="h5 fw-bold mb-2">Administrator</h3>
                <p className="text-muted small mb-4">
                  Oversee department statistics, manage faculty assignments, track low attendance alerts, and manage academic sessions.
                </p>
                <div className="mt-auto">
                  <Link to="/login" className="btn btn-outline-primary btn-sm w-100">
                    Admin Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-top py-4 bg-light text-center text-muted" style={{ fontSize: '13px' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="fw-semibold text-dark mb-1">Sunrise Institute of Technology</div>
          <div>Knowledge Park Sector 4, Greater Noida, Uttar Pradesh 201310, India</div>
          <div className="mt-1">Affiliated to State Technical University | Approved by AICTE, New Delhi</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
