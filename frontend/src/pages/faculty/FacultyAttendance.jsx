import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FacultyAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [classDate, setClassDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Attendance marking state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceRemarks, setAttendanceRemarks] = useState({});
  const [saveSuccess, setSaveSuccess] = useState('');
  const [inlineError, setInlineError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reports section on SAME page per Step 6
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportFrom, setReportFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get('/faculty/courses')
      .then((res) => {
        setCourses(res.data);
        if (res.data.length > 0) {
          setSelectedCourse(res.data[0].courseId);
        }
      })
      .catch(console.error);
  }, []);

  // Check if date is Sat/Sun
  const isWeekend = (dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    const day = dt.getDay(); // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6;
  };

  const fetchStudentsForMarking = () => {
    setInlineError('');
    setSaveSuccess('');

    if (!selectedCourse) return;

    if (isWeekend(classDate)) {
      setInlineError('Selected date is a weekend holiday (Saturday / Sunday). Attendance cannot be marked on weekends.');
      setStudents([]);
      return;
    }

    setLoadingStudents(true);
    api.get('/faculty/attendance/students', {
      params: { courseId: selectedCourse, date: classDate }
    })
      .then((res) => {
        setStudents(res.data);
        const initialStatus = {};
        const initialRemarks = {};
        res.data.forEach((st) => {
          initialStatus[st.studentId] = st.status || 'PRESENT';
          initialRemarks[st.studentId] = st.remarks || '';
        });
        setAttendanceRecords(initialStatus);
        setAttendanceRemarks(initialRemarks);
      })
      .catch((err) => {
        setInlineError(err.response?.data?.message || 'Failed to load students for attendance');
        setStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  };

  const fetchReport = () => {
    if (!selectedCourse) return;
    setLoadingReport(true);
    api.get('/faculty/attendance/report', {
      params: { courseId: selectedCourse, fromDate: reportFrom, toDate: reportTo }
    })
      .then((res) => setReportData(res.data))
      .catch(console.error)
      .finally(() => setLoadingReport(false));
  };

  useEffect(() => {
    if (selectedCourse && classDate) {
      fetchStudentsForMarking();
      fetchReport();
    }
  }, [selectedCourse, classDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setAttendanceRemarks((prev) => ({ ...prev, [studentId]: remark }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((st) => {
      updated[st.studentId] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError('');
    setSaveSuccess('');

    if (isWeekend(classDate)) {
      setInlineError('Cannot submit attendance for a weekend holiday.');
      return;
    }

    const records = students.map((st) => ({
      studentId: st.studentId,
      status: attendanceRecords[st.studentId] || 'PRESENT',
      remarks: attendanceRemarks[st.studentId] || '',
    }));

    setSubmitting(true);
    try {
      const res = await api.post('/faculty/attendance/mark', {
        courseId: parseInt(selectedCourse, 10),
        classDate,
        records,
      });
      setSaveSuccess(res.data.message || `Attendance saved for ${records.length} students`);
      fetchReport();
    } catch (err) {
      setInlineError(err.response?.data?.message || 'Failed to save attendance records.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Course Attendance Register</h1>
        <p className="text-muted small mb-0">Record daily classroom attendance and view course-wise cumulative reports</p>
      </div>

      {/* Control Toolbar */}
      <div className="card mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Select Course</label>
              <select
                className="form-select form-select-sm"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Class Date (Mon - Fri Only)</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={classDate}
                onChange={(e) => setClassDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm w-100"
                onClick={fetchStudentsForMarking}
              >
                Reload Students
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Sat/Sun Error per Step 6 */}
      {inlineError && (
        <div className="alert alert-danger py-2 px-3 small mb-4" role="alert">
          {inlineError}
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="alert alert-success py-2 px-3 small mb-4" role="alert">
          {saveSuccess}
        </div>
      )}

      {/* Student List Form for Attendance */}
      <div className="card mb-5">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Student Attendance Marking</span>
          {students.length > 0 && !isWeekend(classDate) && (
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-success btn-sm py-0 px-2"
                style={{ fontSize: '11px' }}
                onClick={() => markAll('PRESENT')}
              >
                Mark All Present
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm py-0 px-2"
                style={{ fontSize: '11px' }}
                onClick={() => markAll('ABSENT')}
              >
                Mark All Absent
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-striped table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th className="text-center" style={{ width: '280px' }}>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStudents ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">Loading students...</td>
                    </tr>
                  ) : isWeekend(classDate) ? (
                    <tr>
                      <td colSpan="4" className="empty-state text-danger">
                        Weekend holiday. No attendance can be marked on Saturday or Sunday.
                      </td>
                    </tr>
                  ) : students.length > 0 ? (
                    students.map((st) => (
                      <tr key={st.studentId}>
                        <td className="fw-semibold">{st.rollNo}</td>
                        <td>{st.name}</td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-3">
                            {['PRESENT', 'ABSENT', 'LEAVE'].map((opt) => (
                              <div className="form-check form-check-inline m-0" key={opt}>
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name={`status-${st.studentId}`}
                                  id={`status-${st.studentId}-${opt}`}
                                  value={opt}
                                  checked={attendanceRecords[st.studentId] === opt}
                                  onChange={() => handleStatusChange(st.studentId, opt)}
                                />
                                <label
                                  className={`form-check-label small ${
                                    opt === 'PRESENT'
                                      ? 'text-success fw-semibold'
                                      : opt === 'ABSENT'
                                      ? 'text-danger fw-semibold'
                                      : 'text-warning'
                                  }`}
                                  htmlFor={`status-${st.studentId}-${opt}`}
                                >
                                  {opt}
                                </label>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Optional note"
                            value={attendanceRemarks[st.studentId] || ''}
                            onChange={(e) => handleRemarkChange(st.studentId, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        No students enrolled in this course yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {students.length > 0 && !isWeekend(classDate) && (
            <div className="card-footer bg-white text-end p-3">
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4"
                disabled={submitting}
              >
                {submitting ? 'Saving Register...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Reports Section on SAME Page per Step 6 */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-bold">Course Attendance Report & Statistics</span>
          <div className="d-flex align-items-center gap-2">
            <input
              type="date"
              className="form-control form-control-sm"
              value={reportFrom}
              onChange={(e) => setReportFrom(e.target.value)}
              style={{ width: '135px' }}
            />
            <span className="text-muted small">to</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={reportTo}
              onChange={(e) => setReportTo(e.target.value)}
              style={{ width: '135px' }}
            />
            <button className="btn btn-outline-secondary btn-sm py-1 px-2" onClick={fetchReport}>
              Filter
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th className="text-center">Present</th>
                  <th className="text-center">Absent</th>
                  <th className="text-center">Leave</th>
                  <th className="text-center">Total Working Days</th>
                  <th className="text-end">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {loadingReport ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">Loading report...</td>
                  </tr>
                ) : reportData.length > 0 ? (
                  reportData.map((row) => (
                    <tr key={row.studentId}>
                      <td className="fw-semibold">{row.rollNo}</td>
                      <td>{row.name}</td>
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
                    <td colSpan="7" className="empty-state">No attendance records found for this course in the date range.</td>
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

export default FacultyAttendance;
