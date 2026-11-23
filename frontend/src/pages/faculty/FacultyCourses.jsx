import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FacultyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty/courses')
      .then((res) => setCourses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">My Assigned Courses</h1>
        <p className="text-muted small mb-0">Teaching curriculum assignments and enrolled cohort counts</p>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Assigned Courses</span>
          <span className="badge bg-primary">{courses.length} Courses</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th className="text-center">Enrolled Students</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">Loading assigned courses...</td>
                  </tr>
                ) : courses.length > 0 ? (
                  courses.map((c) => (
                    <tr key={c.courseId}>
                      <td className="fw-semibold">{c.courseCode}</td>
                      <td className="fw-semibold">{c.courseName}</td>
                      <td>{c.credits} Credits</td>
                      <td>{c.department}</td>
                      <td>Sem {c.semester}</td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border">
                          {c.enrolledStudentsCount} Students
                        </span>
                      </td>
                      <td className="text-end">
                        <a
                          href="/faculty/attendance"
                          className="btn btn-outline-primary btn-sm py-0 px-2"
                          style={{ fontSize: '12px' }}
                        >
                          Mark Attendance
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">No courses currently assigned to you.</td>
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

export default FacultyCourses;
