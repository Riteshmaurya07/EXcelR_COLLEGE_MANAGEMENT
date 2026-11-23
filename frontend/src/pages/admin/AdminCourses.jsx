import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState('');
  const [pageError, setPageError] = useState('');

  // Add course state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    courseName: '',
    courseCode: '',
    credits: 4,
    department: 'CSE',
    semester: 3,
    description: '',
  });
  const [courseError, setCourseError] = useState('');

  // Edit course state
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({
    courseName: '',
    courseCode: '',
    credits: 4,
    semester: 3,
    description: '',
  });
  const [editCourseError, setEditCourseError] = useState('');

  // Assign faculty state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/faculties'),
      ]);
      setCourses(cRes.data);
      setFaculties(fRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseError('');
    setSubmitting(true);
    try {
      await api.post('/admin/courses', {
        ...courseForm,
        credits: parseInt(courseForm.credits, 10),
        semester: parseInt(courseForm.semester, 10),
      });
      setShowAddCourse(false);
      setCourseForm({
        courseName: '',
        courseCode: '',
        credits: 4,
        department: 'CSE',
        semester: 3,
        description: '',
      });
      setPageMessage('Course created successfully.');
      fetchData();
    } catch (err) {
      setCourseError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (course) => {
    setEditingCourseId(course.id);
    setEditCourseForm({
      courseName: course.courseName,
      courseCode: course.courseCode,
      credits: course.credits,
      semester: course.semester,
      description: course.description || '',
    });
    setEditCourseError('');
    setShowEditCourse(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setEditCourseError('');
    setSubmitting(true);
    try {
      await api.put(`/admin/courses/${editingCourseId}`, {
        ...editCourseForm,
        credits: parseInt(editCourseForm.credits, 10),
        semester: parseInt(editCourseForm.semester, 10),
      });
      setShowEditCourse(false);
      setPageMessage('Course updated successfully.');
      fetchData();
    } catch (err) {
      setEditCourseError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    setPageError('');
    setPageMessage('');
    if (!window.confirm(`Are you sure you want to delete course ${course.courseCode} (${course.courseName})?`)) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${course.id}`);
      setPageMessage(`Course ${course.courseCode} deleted successfully.`);
      fetchData();
    } catch (err) {
      setPageError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleUnassignFaculty = async (courseId, facultyId) => {
    setPageError('');
    setPageMessage('');
    if (!window.confirm('Remove faculty assignment from this course?')) {
      return;
    }

    try {
      await api.delete(`/admin/courses/${courseId}/faculty/${facultyId}`);
      setPageMessage('Faculty unassigned successfully.');
      fetchData();
    } catch (err) {
      setPageError(err.response?.data?.message || 'Failed to unassign faculty');
    }
  };

  const handleOpenAssign = (course) => {
    setSelectedCourse(course);
    setSelectedFacultyId('');
    setAssignError('');
    setShowAssignModal(true);
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    setAssignError('');
    setSubmitting(true);
    try {
      await api.post('/admin/assign-faculty', {
        courseId: selectedCourse.id,
        facultyId: parseInt(selectedFacultyId, 10),
      });
      setShowAssignModal(false);
      setPageMessage('Faculty assigned successfully.');
      fetchData();
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign faculty');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Academic Courses</h1>
          <p className="text-muted small mb-0">Curriculum catalog and faculty subject allocations</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddCourse(true)}>
          + Create Course
        </button>
      </div>

      {pageMessage && <div className="alert alert-success alert-dismissible fade show py-2 small mb-3">{pageMessage}</div>}
      {pageError && <div className="alert alert-danger alert-dismissible fade show py-2 small mb-3">{pageError}</div>}

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Dept</th>
                  <th>Sem</th>
                  <th>Assigned Faculty</th>
                  <th className="text-center">Enrolled</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Loading courses...
                    </td>
                  </tr>
                ) : courses.length > 0 ? (
                  courses.map((c) => (
                    <tr key={c.id}>
                      <td className="fw-semibold">{c.courseCode}</td>
                      <td>{c.courseName}</td>
                      <td>{c.credits}</td>
                      <td>{c.department}</td>
                      <td>Sem {c.semester}</td>
                      <td>
                        {c.assignedFaculties && c.assignedFaculties.length > 0 ? (
                          c.assignedFaculties.map((f) => (
                            <span key={f.facultyId} className="badge bg-light text-dark border me-1 d-inline-flex align-items-center py-1">
                              <span>{f.facultyName}</span>
                              <button
                                type="button"
                                className="btn-close ms-1"
                                style={{ fontSize: '0.55rem' }}
                                title="Unassign Faculty"
                                onClick={() => handleUnassignFaculty(c.id, f.facultyId)}
                              ></button>
                            </span>
                          ))
                        ) : (
                          <span className="text-muted small">Not Assigned</span>
                        )}
                      </td>
                      <td className="text-center">{c.enrolledCount}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary py-0 px-2"
                            style={{ fontSize: '12px' }}
                            onClick={() => handleOpenAssign(c)}
                            title="Assign Faculty"
                          >
                            Assign
                          </button>
                          <button
                            className="btn btn-outline-secondary py-0 px-2"
                            style={{ fontSize: '12px' }}
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Course"
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger py-0 px-2"
                            style={{ fontSize: '12px' }}
                            onClick={() => handleDeleteCourse(c)}
                            title="Delete Course"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">No courses found in curriculum.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold fs-6">Add New Course</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddCourse(false)}></button>
              </div>
              <form onSubmit={handleCreateCourse}>
                <div className="modal-body">
                  {courseError && <div className="alert alert-danger py-2 small">{courseError}</div>}
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Course Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Operating Systems"
                        value={courseForm.courseName}
                        onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Course Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. CS302"
                        value={courseForm.courseCode}
                        onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Credits</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="form-control"
                        value={courseForm.credits}
                        onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={courseForm.department}
                        onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                        required
                      >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="EE">EE</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Semester</label>
                      <select
                        className="form-select"
                        value={courseForm.semester}
                        onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        placeholder="Topics covered, syllabus overview..."
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAddCourse(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditCourse && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold fs-6">Edit Course ({editCourseForm.courseCode})</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditCourse(false)}></button>
              </div>
              <form onSubmit={handleUpdateCourse}>
                <div className="modal-body">
                  {editCourseError && <div className="alert alert-danger py-2 small">{editCourseError}</div>}
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Course Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCourseForm.courseName}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, courseName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Course Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editCourseForm.courseCode}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, courseCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Credits</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="form-control"
                        value={editCourseForm.credits}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, credits: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Semester</label>
                      <select
                        className="form-select"
                        value={editCourseForm.semester}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, semester: e.target.value })}
                        required
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        rows="3"
                        className="form-control"
                        value={editCourseForm.description}
                        onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowEditCourse(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Faculty Modal */}
      {showAssignModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold fs-6">
                  Assign Faculty to {selectedCourse?.courseCode} - {selectedCourse?.courseName}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignFaculty}>
                <div className="modal-body">
                  {assignError && <div className="alert alert-danger py-2 small">{assignError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Select Faculty Member</label>
                    <select
                      className="form-select"
                      value={selectedFacultyId}
                      onChange={(e) => setSelectedFacultyId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Instructor --</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.employeeId}) - {f.department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
