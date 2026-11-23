import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    designation: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [submittingPwd, setSubmittingPwd] = useState(false);

  const fetchProfile = () => {
    return api.get('/profile')
      .then((res) => {
        setProfile(res.data);
        const d = res.data.details || {};
        setEditForm({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          phone: d.phone || '',
          designation: d.designation || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleStartEdit = () => {
    setProfileMessage('');
    setProfileError('');
    const d = profile?.details || {};
    setEditForm({
      firstName: d.firstName || '',
      lastName: d.lastName || '',
      phone: d.phone || '',
      designation: d.designation || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setProfileError('First name and last name are required.');
      return;
    }

    if (editForm.phone && editForm.phone.replace(/\D/g, '').length < 10) {
      setProfileError('Contact phone must contain at least 10 digits.');
      return;
    }

    setSubmittingProfile(true);
    try {
      const res = await api.put('/profile', {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        phone: editForm.phone.trim(),
        designation: profile?.role === 'FACULTY' ? editForm.designation.trim() : undefined,
      });

      setProfile(res.data);
      const updatedDetails = res.data.details || {};
      const newFullName = `${updatedDetails.firstName || ''} ${updatedDetails.lastName || ''}`.trim();
      updateUser({ name: newFullName, profile: updatedDetails });

      setProfileMessage('Profile details updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMessage('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    setSubmittingPwd(true);
    try {
      const res = await api.post('/profile/change-password', {
        oldPassword,
        newPassword,
      });
      setPwdMessage(res.data.message || 'Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmittingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        Loading user profile...
      </div>
    );
  }

  const details = profile?.details || {};
  const fullName = details.name || 
    (details.firstName ? `${details.firstName} ${details.lastName || ''}`.trim() : 
    (profile?.role === 'ADMIN' ? 'Sunrise Admin' : 'Portal User'));

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">User Profile & Account</h1>
        <p className="text-muted small mb-0">Manage your institutional credentials and security settings</p>
      </div>

      <div className="row g-4">
        {/* Profile Details Card */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Personal & Institutional Details</span>
              {!isEditing ? (
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm py-1 px-3"
                  onClick={handleStartEdit}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm py-1 px-3"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="card-body">
              {profileMessage && <div className="alert alert-success py-2 small mb-3">{profileMessage}</div>}
              {profileError && <div className="alert alert-danger py-2 small mb-3">{profileError}</div>}

              {isEditing ? (
                /* Edit Profile Form */
                <form onSubmit={handleSaveProfile}>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small">First Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Last Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small">Contact Phone</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. +91 9876543210"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                    />
                    <div className="text-muted" style={{ fontSize: '11px' }}>Must have at least 10 digits</div>
                  </div>

                  {profile?.role === 'FACULTY' && (
                    <div className="mb-3">
                      <label className="form-label small">Designation</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {/* Read-only academic info */}
                  {profile?.role === 'STUDENT' && (
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small text-muted">Roll Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light"
                          value={details.rollNo || ''}
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-muted">Semester</label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light"
                          value={`Semester ${details.semester || ''}`}
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="col-12">
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          * Academic details (roll number, department, semester) can only be changed by Admin.
                        </div>
                      </div>
                    </div>
                  )}

                  {profile?.role === 'FACULTY' && (
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small text-muted">Employee ID</label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light"
                          value={details.employeeId || ''}
                          disabled
                          readOnly
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small text-muted">Department</label>
                        <input
                          type="text"
                          className="form-control form-control-sm bg-light"
                          value={details.department || ''}
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm py-2 px-3"
                      disabled={submittingProfile}
                    >
                      {submittingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm py-2 px-3"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Read-only View */
                <div>
                  <div className="mb-3">
                    <label className="text-muted small d-block">Full Name</label>
                    <span className="fw-bold fs-6 text-dark">{fullName}</span>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small d-block">Institutional Email</label>
                    <span className="fw-semibold">{profile?.email}</span>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small d-block">System Role</label>
                    <span className="badge bg-primary">{profile?.role}</span>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small d-block">Department</label>
                    <span className="fw-semibold">{details.department || 'Administration'}</span>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small d-block">Account Status</label>
                    <span className={`badge ${profile?.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                      {profile?.status}
                    </span>
                  </div>

                  {/* Student specific fields */}
                  {profile?.role === 'STUDENT' && (
                    <>
                      <div className="mb-3">
                        <label className="text-muted small d-block">Roll Number</label>
                        <span className="fw-semibold">{details.rollNo}</span>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small d-block">Current Semester</label>
                        <span className="fw-semibold">Semester {details.semester}</span>
                      </div>
                    </>
                  )}

                  {/* Faculty specific fields */}
                  {profile?.role === 'FACULTY' && (
                    <>
                      <div className="mb-3">
                        <label className="text-muted small d-block">Employee ID</label>
                        <span className="fw-semibold">{details.employeeId}</span>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small d-block">Designation</label>
                        <span className="fw-semibold">{details.designation}</span>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="text-muted small d-block">Contact Phone</label>
                    <span>{details.phone || '+91 9876543200'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-white">
              <span className="fw-semibold">Change Account Password</span>
            </div>
            <div className="card-body">
              {pwdMessage && <div className="alert alert-success py-2 small mb-3">{pwdMessage}</div>}
              {pwdError && <div className="alert alert-danger py-2 small mb-3">{pwdError}</div>}

              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label small" htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="form-control form-control-sm"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small" htmlFor="profileNewPassword">New Password</label>
                  <input
                    id="profileNewPassword"
                    type="password"
                    className="form-control form-control-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small" htmlFor="profileConfirmPassword">Confirm New Password</label>
                  <input
                    id="profileConfirmPassword"
                    type="password"
                    className="form-control form-control-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm py-2 px-3"
                  disabled={submittingPwd}
                >
                  {submittingPwd ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
