import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');

  useEffect(() => {
    api.get('/faculty/students')
      .then((res) => setStudents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const courseOptions = Array.from(new Set(students.map((s) => s.courseName)));

  const filtered = selectedCourseFilter
    ? students.filter((s) => s.courseName === selectedCourseFilter)
    : students;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Enrolled Students Roster</h1>
          <p className="text-muted small mb-0">Students enrolled across your assigned academic subjects</p>
        </div>
        {courseOptions.length > 0 && (
          <div style={{ width: '250px' }}>
            <select
              className="form-select form-select-sm"
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
            >
              <option value="">All Courses ({students.length})</option>
              {courseOptions.map((cName) => (
                <option key={cName} value={cName}>{cName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Enrolled Course</th>
                  <th className="text-end">Attendance in My Course</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">Loading students...</td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((s, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">{s.rollNo}</td>
                      <td>{s.name}</td>
                      <td>{s.department}</td>
                      <td>Sem {s.semester}</td>
                      <td>
                        <span className="fw-semibold">{s.courseCode}</span> - {s.courseName}
                      </td>
                      <td className="text-end">
                        <span
                          className={
                            s.attendancePercentage >= 75
                              ? 'pct-high'
                              : s.attendancePercentage >= 60
                              ? 'pct-med'
                              : 'pct-low'
                          }
                        >
                          {s.attendancePercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No students found.</td>
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

export default FacultyStudents;
