import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Own attendance state per Step 6
  const [ownStatus, setOwnStatus] = useState('PRESENT');
  const [ownMessage, setOwnMessage] = useState('');
  const [ownError, setOwnError] = useState('');
  const [submittingOwn, setSubmittingOwn] = useState(false);

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/faculty/dashboard')
      .then((res) => {
        setData(res.data);
        if (res.data.todayOwnAttendance) {
          setOwnStatus(res.data.todayOwnAttendance);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkOwnAttendance = async (e) => {
    e.preventDefault();
    setOwnMessage('');
    setOwnError('');

    if (data?.isWeekend) {
      setOwnError('Attendance cannot be marked on weekend holidays.');
      return;
    }

    setSubmittingOwn(true);
    try {
      const res = await api.post('/faculty/attendance/mark-own', {
        attendanceDate: data.todayDate,
        status: ownStatus,
      });
      setOwnMessage(res.data.message || 'Your attendance has been recorded successfully.');
      fetchDashboard();
    } catch (err) {
      setOwnError(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSubmittingOwn(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Loading faculty dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Faculty Academic Portal</h1>
        <p className="text-muted small mb-0">
          Welcome, {data?.facultyName} ({data?.employeeId}) — {data?.designation}, {data?.department}
        </p>
      </div>

      <div className="row g-3 mb-4">
        {/* Stat 1: Assigned Courses */}
        <div className="col-md-6 col-lg-4">
          <div className="stat-card">
            <div className="stat-card-title">Assigned Courses</div>
            <div className="stat-card-value">{data?.coursesCount || 0}</div>
            <div className="text-muted small mt-1">Teaching Subjects</div>
          </div>
        </div>

        {/* Stat 2: Total Students */}
        <div className="col-md-6 col-lg-4">
          <div className="stat-card">
            <div className="stat-card-title">Enrolled Students</div>
            <div className="stat-card-value">{data?.totalStudents || 0}</div>
            <div className="text-muted small mt-1">Across All Classes</div>
          </div>
        </div>

        {/* Stat 3: Today's Pending Registers */}
        <div className="col-md-12 col-lg-4">
          <div className="stat-card">
            <div className="stat-card-title">Attendance Pending Today</div>
            <div className="stat-card-value text-danger">
              {data?.isHoliday ? (
                <span className="badge bg-secondary text-white py-1 px-2" style={{ fontSize: '13px' }}>
                  {data?.holidayName || 'Holiday'}
                </span>
              ) : (
                data?.pendingAttendance?.length || 0
              )}
            </div>
            <div className="text-muted small mt-1">
              {data?.isHoliday ? 'Institutional Holiday (No Class)' : 'Classes requiring register mark'}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* "Mark My Attendance" card per Step 6 */}
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header bg-white">
              <span className="fw-semibold">Mark My Attendance</span>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <span className="text-muted small">Date: </span>
                <span className="fw-bold">{data?.todayDate}</span>
                {data?.isWeekend && (
                  <span className="badge bg-secondary ms-2">Weekend Holiday</span>
                )}
              </div>

              {data?.todayOwnAttendance && (
                <div className="alert alert-info py-2 small mb-3">
                  Status currently marked: <strong>{data.todayOwnAttendance}</strong>
                </div>
              )}

              {ownMessage && <div className="alert alert-success py-2 small mb-3">{ownMessage}</div>}
              {ownError && <div className="alert alert-danger py-2 small mb-3">{ownError}</div>}

              <form onSubmit={handleMarkOwnAttendance}>
                <div className="mb-3">
                  <label className="form-label">Attendance Status</label>
                  <div className="d-flex gap-3">
                    {['PRESENT', 'ABSENT', 'LEAVE'].map((st) => (
                      <div className="form-check" key={st}>
                        <input
                          id={`own-${st}`}
                          type="radio"
                          name="ownStatus"
                          className="form-check-input"
                          value={st}
                          checked={ownStatus === st}
                          onChange={(e) => setOwnStatus(e.target.value)}
                          disabled={data?.isWeekend}
                        />
                        <label className="form-check-label small" htmlFor={`own-${st}`}>
                          {st}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingOwn || data?.isWeekend}
                >
                  {submittingOwn ? 'Saving...' : 'Save My Attendance'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Pending Student Attendance List */}
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Today's Pending Student Attendance</span>
              <span className="badge bg-warning text-dark">
                {data?.isWeekend ? 0 : data?.pendingAttendance?.length || 0} Pending
              </span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Enrolled Students</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.isWeekend ? (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          Weekend holiday. No student attendance needs to be marked today.
                        </td>
                      </tr>
                    ) : data?.pendingAttendance && data.pendingAttendance.length > 0 ? (
                      data.pendingAttendance.map((p) => (
                        <tr key={p.courseId}>
                          <td className="fw-semibold">{p.courseCode}</td>
                          <td>{p.courseName}</td>
                          <td>{p.enrolledCount} students</td>
                          <td className="text-end">
                            <a href="/faculty/attendance" className="btn btn-outline-primary btn-sm py-0 px-2" style={{ fontSize: '12px' }}>
                              Mark Register
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="empty-state">
                          All attendance registers for today have been completed.
                        </td>
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

export default FacultyDashboard;
