import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentCourses = () => {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/student/courses'),
        api.get('/student/my-courses'),
      ]);
      setAvailableCourses(availRes.data);
      setMyCourses(myRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnrol = async (courseId) => {
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/student/courses/${courseId}/enrol`);
      setMessage(res.data.message || 'Course enrollment successful');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enrol in course');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Courses & Enrollment</h1>
        <p className="text-muted small mb-0">Browse curriculum offerings and view your enrolled academic subjects</p>
      </div>

      {message && <div className="alert alert-success py-2 small mb-3">{message}</div>}
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

      {/* Available Courses Table */}
      <div className="card mb-5">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Available Curriculum Courses</span>
          <span className="text-muted small">Semester Offerings</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Dept</th>
                  <th>Sem</th>
                  <th>Assigned Faculty</th>
                  <th className="text-end">Enrollment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      Loading courses...
                    </td>
                  </tr>
                ) : availableCourses.length > 0 ? (
                  availableCourses.map((c) => {
                    const studentSem = c.studentSemester;
                    const canEnroll = c.canEnroll !== undefined ? c.canEnroll : (c.semester === studentSem);

                    return (
                      <tr key={c.id}>
                        <td className="fw-semibold">{c.courseCode}</td>
                        <td>{c.courseName}</td>
                        <td>{c.credits} Credits</td>
                        <td>{c.department}</td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            Sem {c.semester}
                          </span>
                        </td>
                        <td>{c.assignedFaculty}</td>
                        <td className="text-end">
                          {c.isEnrolled ? (
                            <span className="badge bg-success" style={{ fontSize: '11px' }}>
                              ENROLLED
                            </span>
                          ) : !canEnroll ? (
                            <button
                              className="btn btn-outline-secondary btn-sm py-0 px-2"
                              style={{ fontSize: '11px', cursor: 'not-allowed' }}
                              disabled
                              title={`This course is for Semester ${c.semester}, you are in Semester ${studentSem}`}
                            >
                              Sem {c.semester} Only
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm py-0 px-3"
                              style={{ fontSize: '12px' }}
                              onClick={() => handleEnrol(c.id)}
                            >
                              Enrol
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">No courses currently available for enrollment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* My Enrolled Courses Section */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>My Enrolled Courses</span>
          <span className="badge bg-primary">{myCourses.length} Enrolled</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Department</th>
                  <th>Assigned Faculty</th>
                  <th>Enrolled On</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      Loading your courses...
                    </td>
                  </tr>
                ) : myCourses.length > 0 ? (
                  myCourses.map((mc) => (
                    <tr key={mc.id}>
                      <td className="fw-semibold">{mc.courseCode}</td>
                      <td className="fw-semibold">{mc.courseName}</td>
                      <td>{mc.credits} Credits</td>
                      <td>{mc.department}</td>
                      <td>
                        <span className="fw-semibold text-primary">{mc.assignedFaculty}</span>
                      </td>
                      <td className="text-muted small">
                        {mc.enrolledOn ? new Date(mc.enrolledOn).toLocaleDateString('en-GB') : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state">No courses enrolled for this academic session.</td>
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

export default StudentCourses;
