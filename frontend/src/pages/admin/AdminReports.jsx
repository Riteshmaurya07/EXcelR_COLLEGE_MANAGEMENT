import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'faculty'
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Reports data
  const [studentReport, setStudentReport] = useState([]);
  const [facultyReport, setFacultyReport] = useState([]);
  const [loading, setLoading] = useState(false);

  // Admin mark faculty attendance state
  const [markFacultyId, setMarkFacultyId] = useState('');
  const [markDate, setMarkDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState('PRESENT');
  const [markMessage, setMarkMessage] = useState('');
  const [markError, setMarkError] = useState('');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    api.get('/admin/courses').then((res) => setCourses(res.data)).catch(console.error);
    api.get('/admin/faculties').then((res) => setFaculties(res.data)).catch(console.error);
  }, []);

  const fetchReports = () => {
    setLoading(true);
    if (activeTab === 'student') {
      const params = { fromDate, toDate };
      if (selectedCourse) params.courseId = selectedCourse;
      api.get('/admin/reports/student', { params })
        .then((res) => setStudentReport(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      api.get('/admin/reports/faculty', { params: { fromDate, toDate } })
        .then((res) => setFacultyReport(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, selectedCourse, fromDate, toDate]);

  const handleMarkFacultyAttendance = async (e) => {
    e.preventDefault();
    setMarkMessage('');
    setMarkError('');

    // Sat/Sun validation check per Step 2 & 4
    const day = new Date(markDate).getUTCDay(); // 0 is Sun, 6 is Sat
    if (day === 0 || day === 6) {
      setMarkError('Attendance cannot be marked on weekends (Saturday / Sunday).');
      return;
    }

    setMarking(true);
    try {
      await api.post('/admin/faculty-attendance/mark', {
        facultyId: parseInt(markFacultyId, 10),
        attendanceDate: markDate,
        status: markStatus,
      });
      setMarkMessage('Faculty attendance successfully recorded.');
      fetchReports();
    } catch (err) {
      setMarkError(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Attendance Reports & Audits</h1>
        <p className="text-muted small mb-0">Detailed attendance records across students and academic faculty</p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'student' ? 'active fw-bold' : ''}`}
            onClick={() => setActiveTab('student')}
            style={{ color: activeTab === 'student' ? 'var(--color-primary)' : 'inherit' }}
          >
            Student Attendance Report
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'faculty' ? 'active fw-bold' : ''}`}
            onClick={() => setActiveTab('faculty')}
            style={{ color: activeTab === 'faculty' ? 'var(--color-primary)' : 'inherit' }}
          >
            Faculty Attendance & Management
          </button>
        </li>
      </ul>

      {/* Filter Toolbar */}
      <div className="card mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            {activeTab === 'student' && (
              <div className="col-md-4">
                <label className="form-label">Filter by Course</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-primary btn-sm w-100" onClick={fetchReports}>
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content for Student Attendance Tab */}
      {activeTab === 'student' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <span>Student Performance & Attendance Summary</span>
            <span className="text-muted small">Showing {studentReport.length} enrollment records</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th className="text-center">Present</th>
                    <th className="text-center">Absent</th>
                    <th className="text-center">Leave</th>
                    <th className="text-center">Total Working Days</th>
                    <th className="text-end">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        Calculating attendance metrics...
                      </td>
                    </tr>
                  ) : studentReport.length > 0 ? (
                    studentReport.map((row, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold">{row.rollNo}</td>
                        <td>{row.studentName}</td>
                        <td>
                          <span className="fw-semibold">{row.courseCode}</span> - {row.courseName}
                        </td>
                        <td className="text-center text-success fw-semibold">{row.presentCount}</td>
                        <td className="text-center text-danger">{row.absentCount}</td>
                        <td className="text-center text-warning">{row.leaveCount}</td>
                        <td className="text-center">{row.totalDays}</td>
                        <td className="text-end">
                          <span
                            className={
                              row.attendancePercentage >= 75
                                ? 'pct-high'
                                : row.attendancePercentage >= 60
                                ? 'pct-med'
                                : 'pct-low'
                            }
                          >
                            {row.attendancePercentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="empty-state">No attendance data found for chosen filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Content for Faculty Attendance Tab */}
      {activeTab === 'faculty' && (
        <div>
          {/* Mark Faculty Attendance Card by Admin per Step 4 */}
          <div className="card mb-4 border border-primary-subtle">
            <div className="card-header bg-light">
              <span className="fw-bold">Mark Faculty Attendance (Admin Override)</span>
            </div>
            <div className="card-body">
              {markMessage && <div className="alert alert-success py-2 small mb-3">{markMessage}</div>}
              {markError && <div className="alert alert-danger py-2 small mb-3">{markError}</div>}
              <form onSubmit={handleMarkFacultyAttendance} className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label">Select Faculty</label>
                  <select
                    className="form-select form-select-sm"
                    value={markFacultyId}
                    onChange={(e) => setMarkFacultyId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Faculty Member --</option>
                    {faculties.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.employeeId}) - {f.department}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Date (Mon - Fri Only)</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Attendance Status</label>
                  <select
                    className="form-select form-select-sm"
                    value={markStatus}
                    onChange={(e) => setMarkStatus(e.target.value)}
                    required
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LEAVE">LEAVE</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={marking}>
                    {marking ? 'Saving...' : 'Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Faculty Report Table */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Faculty Attendance Summary</span>
              <span className="text-muted small">{facultyReport.length} instructors</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Faculty Name</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th className="text-center">Present</th>
                      <th className="text-center">Absent</th>
                      <th className="text-center">Leave</th>
                      <th className="text-center">Total Working Days</th>
                      <th className="text-end">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-muted">
                          Loading faculty attendance...
                        </td>
                      </tr>
                    ) : facultyReport.length > 0 ? (
                      facultyReport.map((row, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{row.employeeId}</td>
                          <td>{row.facultyName}</td>
                          <td>{row.department}</td>
                          <td>{row.designation}</td>
                          <td className="text-center text-success fw-semibold">{row.presentCount}</td>
                          <td className="text-center text-danger">{row.absentCount}</td>
                          <td className="text-center text-warning">{row.leaveCount}</td>
                          <td className="text-center">{row.totalDays}</td>
                          <td className="text-end">
                            <span
                              className={
                                row.attendancePercentage >= 75
                                  ? 'pct-high'
                                  : row.attendancePercentage >= 60
                                  ? 'pct-med'
                                  : 'pct-low'
                              }
                            >
                              {row.attendancePercentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="empty-state">No faculty attendance found for chosen dates.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
