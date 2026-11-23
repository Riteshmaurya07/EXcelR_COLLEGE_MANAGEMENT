import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentAttendance = () => {
  const [summary, setSummary] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);

  useEffect(() => {
    api.get('/student/attendance')
      .then((res) => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoadingSummary(false));
  }, []);

  const fetchMonthly = () => {
    setLoadingMonthly(true);
    api.get('/student/attendance/monthly', {
      params: { year: selectedYear, month: selectedMonth }
    })
      .then((res) => setMonthly(res.data))
      .catch(console.error)
      .finally(() => setLoadingMonthly(false));
  };

  useEffect(() => {
    fetchMonthly();
  }, [selectedYear, selectedMonth]);

  const getBadgeClass = (status) => {
    switch (status) {
      case 'PRESENT': return 'badge-present';
      case 'ABSENT': return 'badge-absent';
      case 'LEAVE': return 'badge-leave';
      case 'HOLIDAY': return 'badge-holiday';
      default: return 'bg-light text-muted border';
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Attendance Records</h1>
        <p className="text-muted small mb-0">Course-wise attendance percentages and monthly activity registers</p>
      </div>

      {/* Per-Course Summary Table per Step 5 */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Course-Wise Attendance Percentage</span>
          <span className="text-muted small">Threshold: 75%</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th className="text-center">Classes Attended</th>
                  <th className="text-center">Absences</th>
                  <th className="text-center">Leaves</th>
                  <th className="text-center">Total Working Classes</th>
                  <th className="text-end">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {loadingSummary ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">Calculating attendance...</td>
                  </tr>
                ) : summary.length > 0 ? (
                  summary.map((row) => (
                    <tr key={row.courseId}>
                      <td className="fw-semibold">{row.courseCode}</td>
                      <td>{row.courseName}</td>
                      <td className="text-center text-success fw-semibold">{row.present}</td>
                      <td className="text-center text-danger">{row.absent}</td>
                      <td className="text-center text-warning">{row.leave}</td>
                      <td className="text-center">{row.totalClasses}</td>
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
                    <td colSpan="7" className="empty-state">No attendance recorded for your enrolled courses yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Breakdown per Step 5 */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Monthly Day-by-Day Register (P / A / L / H)</span>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              style={{ width: '130px' }}
            >
              {[
                { m: 1, name: 'January' }, { m: 2, name: 'February' }, { m: 3, name: 'March' },
                { m: 4, name: 'April' }, { m: 5, name: 'May' }, { m: 6, name: 'June' },
                { m: 7, name: 'July' }, { m: 8, name: 'August' }, { m: 9, name: 'September' },
                { m: 10, name: 'October' }, { m: 11, name: 'November' }, { m: 12, name: 'December' },
              ].map((item) => (
                <option key={item.m} value={item.m}>{item.name}</option>
              ))}
            </select>
            <select
              className="form-select form-select-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              style={{ width: '100px' }}
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: '450px' }}>
            <table className="table table-striped table-sm align-middle mb-0">
              <thead className="sticky-top bg-light">
                <tr>
                  <th>Date (DD-MM-YYYY)</th>
                  <th>Day</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th className="text-center">Status</th>
                  <th>Remarks / Note</th>
                </tr>
              </thead>
              <tbody>
                {loadingMonthly ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">Loading register...</td>
                  </tr>
                ) : monthly.length > 0 ? (
                  monthly.map((rec, idx) => {
                    const dateObj = new Date(rec.date);
                    const formattedDate = !isNaN(dateObj)
                      ? `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`
                      : rec.date;
                    return (
                      <tr key={idx} className={rec.status === 'HOLIDAY' ? 'table-light' : ''}>
                        <td className="fw-semibold">{formattedDate}</td>
                        <td className="text-muted small">{rec.dayOfWeek}</td>
                        <td className="fw-semibold">{rec.courseCode}</td>
                        <td>{rec.courseName}</td>
                        <td className="text-center">
                          <span className={`badge-status ${getBadgeClass(rec.status)}`}>
                            {rec.statusCode} ({rec.status})
                          </span>
                        </td>
                        <td className="text-muted small">{rec.remarks || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No register entries found for selected month.</td>
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

export default StudentAttendance;
