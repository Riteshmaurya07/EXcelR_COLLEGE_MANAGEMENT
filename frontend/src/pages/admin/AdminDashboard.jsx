import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard metrics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-5 text-center text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Loading dashboard statistics...
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Administrative Overview</h1>
          <p className="text-muted small mb-0">System metrics, real-time attendance, and department statistics</p>
        </div>
        {stats?.currentSessionName && (
          <span className="badge bg-primary py-2 px-3">
            Active Session: {stats.currentSessionName}
          </span>
        )}
      </div>

      {/* 4 Stat Cards per Step 4 / Fix 1 */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-title">Total Enrolled Students</div>
            <div className="stat-card-value">{stats?.totalStudents || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-title">Teaching Faculty</div>
            <div className="stat-card-value">{stats?.totalFaculty || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-title">Active Courses</div>
            <div className="stat-card-value">{stats?.totalCourses || 0}</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card">
            <div className="stat-card-title">Today's Attendance</div>
            <div className="stat-card-value">
              {stats?.todayAttendanceDisplay === 'Not marked yet' ? (
                <span className="badge bg-secondary text-white py-1 px-2" style={{ fontSize: '13px' }}>
                  Not marked yet
                </span>
              ) : stats?.todayAttendanceDisplay && stats.todayAttendanceDisplay.includes('Holiday') ? (
                <span className="badge bg-secondary text-white py-1 px-2" style={{ fontSize: '12px' }}>
                  {stats.todayAttendanceDisplay}
                </span>
              ) : (
                stats?.todayAttendanceDisplay || (stats?.todayAttendancePercentage != null ? `${stats.todayAttendancePercentage}%` : 'N/A')
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2 Real Tables */}
      <div className="row g-4">
        {/* Table 1: Low Attendance Students (<75% in red) */}
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Attendance Warning (&lt; 75%)</span>
              <span className="badge bg-danger">{stats?.lowAttendanceStudents?.length || 0} flagged</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Dept</th>
                      <th>Sem</th>
                      <th className="text-end">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.lowAttendanceStudents && stats.lowAttendanceStudents.length > 0 ? (
                      stats.lowAttendanceStudents.map((st) => (
                        <tr key={st.studentId}>
                          <td className="fw-semibold">{st.rollNo}</td>
                          <td>{st.name}</td>
                          <td>{st.department}</td>
                          <td>Sem {st.semester}</td>
                          <td className="text-end">
                            <span className="pct-low">{st.attendancePercentage.toFixed(1)}%</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          No students currently below the 75% attendance threshold.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Table 2: Department-wise student count */}
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header">
              <span>Department-Wise Student Distribution</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th className="text-end">Registered Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.departmentStudentCounts && stats.departmentStudentCounts.length > 0 ? (
                      stats.departmentStudentCounts.map((dept, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{dept.department}</td>
                          <td className="text-end">{dept.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="empty-state">No department student data found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
