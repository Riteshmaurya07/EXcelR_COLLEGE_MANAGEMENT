import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'CSE',
    designation: 'Assistant Professor',
    phone: '',
    role: 'FACULTY', // Admin can create ADMIN user also per Step 4
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFaculties = () => {
    setLoading(true);
    api.get('/admin/faculties')
      .then((res) => setFaculties(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleOpenAdd = () => {
    setEditFaculty(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      employeeId: '',
      department: 'CSE',
      designation: 'Assistant Professor',
      phone: '',
      role: 'FACULTY',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditFaculty(f);
    setFormData({
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      password: '',
      employeeId: f.employeeId,
      department: f.department,
      designation: f.designation,
      phone: f.phone || '',
      role: f.role,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editFaculty) {
        await api.put(`/admin/faculties/${editFaculty.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department,
          designation: formData.designation,
          phone: formData.phone,
        });
      } else {
        await api.post('/admin/faculties', formData);
      }
      setShowModal(false);
      fetchFaculties();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/admin/faculties/${id}/status`);
      fetchFaculties();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Faculty & Administrative Staff</h1>
          <p className="text-muted small mb-0">Manage professors, lecturers, and system administrators</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          + Add Faculty / Admin
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Loading faculty profiles...
                    </td>
                  </tr>
                ) : faculties.length > 0 ? (
                  faculties.map((f) => (
                    <tr key={f.id}>
                      <td className="fw-semibold">{f.employeeId}</td>
                      <td>{f.name}</td>
                      <td>{f.department}</td>
                      <td>{f.designation}</td>
                      <td>{f.email}</td>
                      <td>
                        <span className={`badge ${f.role === 'ADMIN' ? 'bg-dark' : 'bg-secondary'}`} style={{ fontSize: '11px' }}>
                          {f.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status ${f.status === 'ACTIVE' ? 'badge-present' : 'badge-absent'}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-secondary btn-sm py-0 px-2 me-1"
                          style={{ fontSize: '12px' }}
                          onClick={() => handleOpenEdit(f)}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm py-0 px-2 ${f.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          style={{ fontSize: '12px' }}
                          onClick={() => handleToggleStatus(f.id)}
                        >
                          {f.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="empty-state">No faculty members found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold fs-6">
                  {editFaculty ? 'Edit Faculty Profile' : 'Add Faculty / Admin User'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger py-2 small">{formError}</div>}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                    {!editFaculty && (
                      <>
                        <div className="col-12">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">System Role</label>
                          <select
                            className="form-select"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                          >
                            <option value="FACULTY">FACULTY</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div className="col-md-6">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.employeeId}
                        disabled={!!editFaculty}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                      >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="EE">EE</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Saving...' : editFaculty ? 'Save Changes' : 'Create Account'}
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

export default AdminFaculties;
