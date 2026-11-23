import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/faculties')
      .then((res) => setFaculties(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Course Instructors & Faculty</h1>
        <p className="text-muted small mb-0">Faculty teaching your currently enrolled subjects</p>
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Assigned Instructors</span>
          <span className="text-muted small">{faculties.length} Instructors</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Course Taught</th>
                  <th>Institutional Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">Loading instructors...</td>
                  </tr>
                ) : faculties.length > 0 ? (
                  faculties.map((f, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">{f.name}</td>
                      <td>{f.department}</td>
                      <td>{f.designation}</td>
                      <td>
                        <span className="fw-semibold">{f.courseCode}</span> - {f.courseName}
                      </td>
                      <td>{f.email}</td>
                      <td>{f.phone || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No instructors currently assigned for your enrolled courses.</td>
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

export default StudentFaculties;
