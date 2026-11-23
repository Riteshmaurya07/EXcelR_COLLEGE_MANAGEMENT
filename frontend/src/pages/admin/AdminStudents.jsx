import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rollNo: '',
    department: 'CSE',
    semester: 1,
    phone: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    api.get('/admin/students')
      .then((res) => setStudents(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAdd = () => {
    setEditStudent(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      rollNo: '',
      department: 'CSE',
      semester: 1,
      phone: '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setEditStudent(st);
    setFormData({
      firstName: st.firstName,
      lastName: st.lastName,
      email: st.email,
      password: '',
      rollNo: st.rollNo,
      department: st.department,
      semester: st.semester,
      phone: st.phone || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editStudent) {
        await api.put(`/admin/students/${editStudent.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department,
          semester: parseInt(formData.semester, 10),
          phone: formData.phone,
        });
      } else {
        await api.post('/admin/students', {
          ...formData,
          semester: parseInt(formData.semester, 10),
        });
      }
      setShowModal(false);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/students/${id}/status`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.rollNo?.toLowerCase().includes(term) ||
      s.name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.department?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Student Management</h1>
          <p className="text-muted small mb-0">Search, manage enrollments, and update student profiles</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          + Register New Student
        </button>
      </div>

      <div className="card">
        <div className="card-header bg-white p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by Roll No, Name, or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Fix 5b: No 0-record flash before data loads */}
            <div className="col-md-7 text-end text-muted small">
              {loading ? (
                <span>Loading records...</span>
              ) : (
                <span>Total: {filteredStudents.length} student records</span>
              )}
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      Loading student records...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((st) => (
                    <tr key={st.id}>
                      <td className="fw-semibold">{st.rollNo}</td>
                      <td>{st.name}</td>
                      <td>{st.email}</td>
                      <td>{st.department}</td>
                      <td>Sem {st.semester}</td>
                      <td>{st.phone || '-'}</td>
                      <td>
                        <span
                          className={`badge ${st.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}
                          style={{ cursor: 'pointer', fontSize: '11px' }}
                          onClick={() => handleToggleStatus(st.id)}
                          title="Click to toggle status"
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-secondary btn-sm py-0 px-2 me-1"
                          style={{ fontSize: '12px' }}
                          onClick={() => handleOpenEdit(st)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      {searchTerm ? 'No student records match the search filter.' : 'No student records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Form Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editStudent ? 'Edit Student Details' : 'Register New Student'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2 small mb-3">{formError}</div>}

                  <div className="row g-2 mb-2">
                    <div className="col">
                      <label className="form-label small mb-1">First Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col">
                      <label className="form-label small mb-1">Last Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small mb-1">Institutional Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!!editStudent}
                    />
                  </div>

                  {!editStudent && (
                    <div className="mb-2">
                      <label className="form-label small mb-1">Initial Password</label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="form-label small mb-1">Roll Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. CSE-2023-014"
                      value={formData.rollNo}
                      onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                      required
                      disabled={!!editStudent}
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col">
                      <label className="form-label small mb-1">Department</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="EE">EE</option>
                      </select>
                    </div>
                    <div className="col">
                      <label className="form-label small mb-1">Semester</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small mb-1">Phone Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Student'}
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

export default AdminStudents;
