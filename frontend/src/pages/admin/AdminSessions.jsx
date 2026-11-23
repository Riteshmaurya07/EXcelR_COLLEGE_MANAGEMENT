import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Session form state
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    sessionName: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Holiday form state
  const [holidayForm, setHolidayForm] = useState({
    date: '',
    name: '',
  });
  const [holidayError, setHolidayError] = useState('');
  const [holidaySuccess, setHolidaySuccess] = useState('');
  const [submittingHoliday, setSubmittingHoliday] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, hRes] = await Promise.all([
        api.get('/admin/sessions'),
        api.get('/admin/holidays'),
      ]);
      setSessions(sRes.data);
      setHolidays(hRes.data);
    } catch (err) {
      console.error('Failed to load session/holiday data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/admin/sessions', formData);
      setShowAdd(false);
      setFormData({
        sessionName: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
      });
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create academic session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/admin/sessions/${id}/activate`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate session');
    }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setHolidayError('');
    setHolidaySuccess('');
    setSubmittingHoliday(true);

    try {
      await api.post('/admin/holidays', {
        date: holidayForm.date,
        name: holidayForm.name.trim(),
      });
      setHolidaySuccess(`Holiday "${holidayForm.name}" added successfully.`);
      setHolidayForm({ date: '', name: '' });
      fetchAllData();
    } catch (err) {
      setHolidayError(err.response?.data?.message || 'Failed to add holiday');
    } finally {
      setSubmittingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (h) => {
    setHolidayError('');
    setHolidaySuccess('');
    if (!window.confirm(`Are you sure you want to remove holiday "${h.name}" on ${h.date}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/holidays/${h.id}`);
      setHolidaySuccess(`Holiday "${h.name}" removed successfully.`);
      fetchAllData();
    } catch (err) {
      setHolidayError(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Sessions Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Academic Sessions & Institutional Calendar</h1>
          <p className="text-muted small mb-0">Configure semesters, active academic years, and statutory college holidays</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          + Add Academic Session
        </button>
      </div>

      <div className="card mb-5">
        <div className="card-header bg-white">
          <span className="fw-semibold">Academic Sessions</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Session Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Loading academic sessions...
                    </td>
                  </tr>
                ) : sessions.length > 0 ? (
                  sessions.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold">{s.sessionName}</td>
                      <td>{s.startDate}</td>
                      <td>{s.endDate}</td>
                      <td>
                        {s.isCurrent ? (
                          <span className="badge bg-success" style={{ fontSize: '11px' }}>
                            CURRENT ACTIVE SESSION
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border" style={{ fontSize: '11px' }}>
                            INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        {!s.isCurrent && (
                          <button
                            className="btn btn-outline-primary btn-sm py-0 px-2"
                            style={{ fontSize: '12px' }}
                            onClick={() => handleActivate(s.id)}
                          >
                            Set as Current
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">No academic sessions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* College Calendar Holidays Section (Fix 6) */}
      <div className="card">
        <div className="card-header bg-white">
          <span className="fw-semibold">College Calendar & Declared Holidays</span>
        </div>
        <div className="card-body">
          {holidaySuccess && <div className="alert alert-success py-2 small mb-3">{holidaySuccess}</div>}
          {holidayError && <div className="alert alert-danger py-2 small mb-3">{holidayError}</div>}

          {/* Form to declare a new holiday */}
          <form onSubmit={handleAddHoliday} className="row g-2 align-items-end mb-4 p-3 bg-light rounded border">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Holiday Date</label>
              <input
                type="date"
                min={todayStr}
                className="form-control form-control-sm"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                required
              />
            </div>
            <div className="col-md-5">
              <label className="form-label small fw-semibold">Holiday Name / Occasion</label>
              <input
                type="text"
                placeholder="e.g. Diwali, Guru Nanak Jayanti, Christmas"
                className="form-control form-control-sm"
                value={holidayForm.name}
                onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <button
                type="submit"
                className="btn btn-primary btn-sm w-100"
                disabled={submittingHoliday}
              >
                {submittingHoliday ? 'Adding...' : '+ Declare Holiday'}
              </button>
            </div>
          </form>

          {/* Table of holidays */}
          <div className="table-responsive">
            <table className="table table-striped table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Holiday Date</th>
                  <th>Occasion / Name</th>
                  <th>Declared By</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-3 text-muted">
                      Loading declared holidays...
                    </td>
                  </tr>
                ) : holidays.length > 0 ? (
                  holidays.map((h) => (
                    <tr key={h.id}>
                      <td className="fw-semibold">{h.date}</td>
                      <td>
                        <span className="badge bg-info text-dark me-2">HOLIDAY</span>
                        {h.name}
                      </td>
                      <td className="text-muted small">{h.createdBy || 'ADMIN'}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-danger btn-sm py-0 px-2"
                          style={{ fontSize: '12px' }}
                          onClick={() => handleDeleteHoliday(h)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-state">No custom holidays declared yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Session Modal */}
      {showAdd && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold fs-6">Add New Academic Session</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdd(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label">Session Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2025-26 Odd Semester"
                      value={formData.sessionName}
                      onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isCurrentCheck"
                      checked={formData.isCurrent}
                      onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="isCurrentCheck">
                      Set as Current Active Session immediately
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAdd(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Academic Session'}
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

export default AdminSessions;
