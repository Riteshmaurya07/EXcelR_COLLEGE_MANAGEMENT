import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [validating, setValidating] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This reset link is invalid or expired. Please request a new one.');
      setTokenValid(false);
      setValidating(false);
      return;
    }

    // Call GET /api/auth/reset-password/validate?token=xxx per Fix 3
    api.get(`/auth/reset-password/validate?token=${token}`)
      .then(() => {
        setTokenValid(true);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'This reset link is invalid or expired. Please request a new one.');
        setTokenValid(false);
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!tokenValid) {
      setError('This reset link is invalid or expired. Please request a new one.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      // Redirect to /login with success query or navigate state
      navigate('/login?reset=success');
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container py-5 my-auto" style={{ maxWidth: '440px' }}>
        <div className="card shadow-none border">
          <div className="card-header text-center py-3 bg-white border-bottom">
            <h2 className="h5 fw-bold mb-1">Set New Password</h2>
            <div className="text-muted small">Sunrise Institute of Technology</div>
          </div>

          <div className="card-body p-4">
            {validating ? (
              <div className="py-4 text-center text-muted">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Validating reset link...
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger py-2 px-3 small mb-3">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label" htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={!tokenValid || loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={!tokenValid || loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={!tokenValid || loading}
                >
                  {loading ? 'Updating Password...' : 'Save Password'}
                </button>

                <div className="text-center pt-2" style={{ fontSize: '13px' }}>
                  <Link to="/login" className="text-decoration-none">
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
