import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-5 text-center text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Loading student dashboard...
      </div>
    );
  }

  const attendancePct = data?.overallAttendancePercentage || 0;
  const progressColor =
    attendancePct >= 75 ? 'bg-success' : attendancePct >= 60 ? 'bg-warning' : 'bg-danger';

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Student Portal Dashboard</h1>
        <p className="text-muted small mb-0">
          Welcome back, {data?.studentName} ({data?.rollNo}) — {data?.department}, Semester {data?.semester}
        </p>
      </div>

      <div className="row g-3 mb-4">
        {/* Stat 1: Enrolled Courses */}
        <div className="col-md-6 col-lg-4">
          <div className="stat-card">
            <div className="stat-card-title">My Registered Courses</div>
            <div className="stat-card-value">{data?.enrolledCoursesCount || 0}</div>
            <div className="text-muted small mt-1">Current Academic Session</div>
          </div>
        </div>

        {/* Stat 2: Overall Attendance % with Progress Bar */}
        <div className="col-md-6 col-lg-8">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="stat-card-title mb-0">Cumulative Attendance</div>
              <span className={`fw-bold fs-5 ${attendancePct >= 75 ? 'pct-high' : attendancePct >= 60 ? 'pct-med' : 'pct-low'}`}>
                {attendancePct.toFixed(1)}%
              </span>
            </div>
            <div className="progress mb-2" style={{ height: '8px' }}>
              <div
                className={`progress-bar ${progressColor}`}
                role="progressbar"
                style={{ width: `${Math.min(attendancePct, 100)}%` }}
                aria-valuenow={attendancePct}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <div className="d-flex justify-content-between text-muted" style={{ fontSize: '11px' }}>
              <span>Minimum Required: 75.0%</span>
              <span>
                {attendancePct >= 75
                  ? 'Satisfactory Attendance'
                  : 'Action Needed: Attendance below 75% limit'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Today's Class Schedule</span>
          {data?.isHoliday && (
            <span className="badge bg-secondary">{data?.holidayName || 'Holiday'}</span>
          )}
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Course Code</th>
                  <th>Course Title</th>
                  <th>Instructor</th>
                  <th>Room / Lab</th>
                </tr>
              </thead>
              <tbody>
                {data?.isHoliday ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      {data?.holidayName ? `Today is ${data.holidayName}. No classes scheduled.` : 'Holiday. No classes scheduled for today.'}
                    </td>
                  </tr>
                ) : data?.todayClasses && data.todayClasses.length > 0 ? (
                  data.todayClasses.map((cls, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold text-primary">{cls.timeSlot}</td>
                      <td className="fw-semibold">{cls.courseCode}</td>
                      <td>{cls.courseName}</td>
                      <td>{cls.facultyName}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{cls.roomNo}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">No scheduled lectures for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
