import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, getDashboardRoute, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom py-2">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="fw-bold" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>
            Sunrise Institute of Technology
          </span>
        </Link>
        <div className="d-flex align-items-center gap-2">
          {/* Prevent logged-out nav flash while checking auth (Fix 5c) */}
          {loading ? (
            <div style={{ height: '31px', width: '140px' }}></div>
          ) : isAuthenticated ? (
            <>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate(getDashboardRoute())}
              >
                Dashboard
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Student Registration
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
