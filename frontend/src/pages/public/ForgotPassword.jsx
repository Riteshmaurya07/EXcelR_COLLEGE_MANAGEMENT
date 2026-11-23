import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'If this email exists, a reset link has been sent.');
    } catch {
      // Per Step 3: always show the exact same message
      setMessage('If this email exists, a reset link has been sent.');
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
            <h2 className="h5 fw-bold mb-1">Reset Password</h2>
            <div className="text-muted small">Sunrise Institute of Technology</div>
          </div>

          <div className="card-body p-4">
            {message ? (
              <div className="text-center py-3">
                <div className="alert alert-success small mb-4">
                  {message}
                </div>
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-muted small mb-3">
                  Enter your registered institutional email address. We will verify the account and generate a secure password reset link.
                </p>
                <div className="mb-3">
                  <label className="form-label" htmlFor="forgotEmail">Institutional Email</label>
                  <input
                    id="forgotEmail"
                    type="email"
                    className="form-control"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Send Reset Link'}
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

export default ForgotPassword;
