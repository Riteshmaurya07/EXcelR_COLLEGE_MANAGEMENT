import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CompleteProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const tokenParam = searchParams.get('oauth_token');
  const nameParam = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';

  const [fullName, setFullName] = useState(nameParam);
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('1');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      localStorage.setItem('cms_token', tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please provide a valid contact phone number (at least 10 digits).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/complete-profile', {
        fullName: fullName.trim(),
        department,
        semester: parseInt(semester, 10),
        phone: phone.trim(),
      });

      login({
        token: res.data.token,
        id: res.data.id,
        email: res.data.email,
        role: res.data.role,
        name: res.data.name,
        profile: res.data.profile,
      });

      navigate('/student/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5">
      <div className="card shadow-sm" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h1 className="h4 fw-bold mb-1">Complete Student Profile</h1>
            <p className="text-muted small mb-0">
              Welcome to Sunrise Institute of Technology! Please select your department and academic semester to finalize your student enrollment.
            </p>
          </div>

          {emailParam && (
            <div className="alert alert-info py-2 small mb-3">
              Signed in as: <strong>{emailParam}</strong>
            </div>
          )}

          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Full Legal Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold">Department</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="ME">Mechanical (ME)</option>
                  <option value="CE">Civil (CE)</option>
                </select>
              </div>

              <div className="col-6">
                <label className="form-label small fw-semibold">Semester</label>
                <select
                  className="form-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Contact Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="text-muted" style={{ fontSize: '11px' }}>
                Used for urgent college alerts and attendance notifications.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={submitting}
            >
              {submitting ? 'Generating Enrollment...' : 'Finalize Profile & Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
