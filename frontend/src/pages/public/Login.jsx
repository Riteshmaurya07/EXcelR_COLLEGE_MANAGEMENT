import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if redirected from reset password or OAuth2
    if (searchParams.get('reset') === 'success') {
      setSuccessMsg('Password reset successful. Please login.');
    }

    const oauthToken = searchParams.get('oauth_token');
    const roleParam = searchParams.get('role');
    const emailParam = searchParams.get('email');
    const fullNameParam = searchParams.get('name');

    if (oauthToken) {
      if (roleParam) {
        login({
          token: oauthToken,
          role: roleParam,
          email: emailParam,
          name: fullNameParam || 'Google User',
        });
        navigate(getDashboardRoute(roleParam));
      } else {
        // Fetch profile with token first to prevent looping to /login (Fix 7a)
        api.get('/profile', { headers: { Authorization: `Bearer ${oauthToken}` } })
          .then((res) => {
            const userRole = res.data.role;
            login({
              token: oauthToken,
              role: userRole,
              email: res.data.email,
              name: res.data.details?.name || fullNameParam || 'Google User',
            });
            navigate(getDashboardRoute(userRole));
          })
          .catch(() => {
            login({
              token: oauthToken,
              role: 'STUDENT',
              email: emailParam,
              name: fullNameParam || 'Google User',
            });
            navigate('/student/dashboard');
          });
      }
      return;
    }

    // Check if Google OAuth is enabled on the backend
    api.get('/auth/oauth-config')
      .then((res) => {
        setGoogleEnabled(Boolean(res.data?.googleEnabled));
      })
      .catch(() => {
        setGoogleEnabled(false);
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      const target = getDashboardRoute(res.data.role);
      navigate(target);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    // Real OAuth2 redirect using configured backend origin (Fix 9c)
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSuccessMsg('');
  };

  // Demo accounts visible ONLY when VITE_SHOW_DEMO is explicitly 'true' (Fix 3)
  const showDemo = import.meta.env.VITE_SHOW_DEMO === 'true';

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container py-5 my-auto" style={{ maxWidth: '440px' }}>
        <div className="card shadow-none border">
          <div className="card-header text-center py-3 bg-white border-bottom">
            <h2 className="h5 fw-bold mb-1">Sign In to College CMS</h2>
            <div className="text-muted small">Sunrise Institute of Technology</div>
          </div>

          <div className="card-body p-4">
            {successMsg && (
              <div className="alert alert-success py-2 px-3 small mb-3" role="alert">
                {successMsg}
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="emailInput">Institutional Email</label>
                <input
                  id="emailInput"
                  type="email"
                  className="form-control"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0" htmlFor="passwordInput">Password</label>
                  <Link to="/forgot-password" className="text-decoration-none small" style={{ fontSize: '12px' }}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="passwordInput"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              {/* Real Google OAuth button - only rendered when configured (Fix 2) */}
              {googleEnabled && (
                <button
                  type="button"
                  onClick={handleGoogleRedirect}
                  className="btn btn-outline-secondary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
                  style={{ fontSize: '13px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="me-1">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Continue with Google
                </button>
              )}
            </form>

            <div className="text-center pt-2 border-top mt-3" style={{ fontSize: '13px' }}>
              <span className="text-muted">New student? </span>
              <Link to="/register" className="fw-semibold text-decoration-none">
                Register here
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Accounts Box - Hidden if VITE_SHOW_DEMO=false (Fix 5d) */}
        {showDemo && (
          <div className="card mt-3 bg-white border p-3">
            <div className="fw-semibold text-muted small text-uppercase mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
              Demo Accounts (One-Click Fill)
            </div>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center p-2 rounded bg-light border">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '12px' }}>Administrator</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>admin@college.edu</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm py-0 px-2"
                  style={{ fontSize: '11px' }}
                  onClick={() => fillDemo('admin@college.edu', 'Admin@123')}
                >
                  Fill
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center p-2 rounded bg-light border">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '12px' }}>Faculty (CSE HOD)</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>anjali.sharma@college.edu</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm py-0 px-2"
                  style={{ fontSize: '11px' }}
                  onClick={() => fillDemo('anjali.sharma@college.edu', 'Faculty@123')}
                >
                  Fill
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center p-2 rounded bg-light border">
                <div>
                  <div className="fw-semibold" style={{ fontSize: '12px' }}>Student (Aarav Sharma)</div>
                  <div className="text-muted" style={{ fontSize: '11px' }}>aarav.sharma@student.college.edu</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm py-0 px-2"
                  style={{ fontSize: '11px' }}
                  onClick={() => fillDemo('aarav.sharma@student.college.edu', 'Student@123')}
                >
                  Fill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
