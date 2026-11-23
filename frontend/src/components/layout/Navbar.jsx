import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout, getDashboardRoute, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand bg-white border-bottom py-2">
      <div className="container" style={{ maxWidth: '1200px' }}>
        <Link className="navbar-brand d-flex align-items-center text-truncate me-2" to="/" style={{ maxWidth: '58%' }}>
          <span className="fw-bold d-none d-sm-inline" style={{ color: 'var(--color-primary)', fontSize: '18px' }}>
            Sunrise Institute of Technology
          </span>
          <span className="fw-bold d-inline d-sm-none" style={{ color: 'var(--color-primary)', fontSize: '16px' }}>
            SIT Portal
          </span>
        </Link>
        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Prevent logged-out nav flash while checking auth (Fix 5c) */}
          {loading ? (
            <div style={{ height: '31px', width: '100px' }}></div>
          ) : isAuthenticated ? (
            <>
              <button
                className="btn btn-outline-primary btn-sm px-2 px-sm-3"
                onClick={() => navigate(getDashboardRoute())}
              >
                Dashboard
              </button>
              <button
                className="btn btn-primary btn-sm px-2 px-sm-3"
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
              <Link to="/login" className="btn btn-outline-primary btn-sm px-2 px-sm-3">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm px-2 px-sm-3 text-nowrap">
                <span className="d-none d-sm-inline">Student </span>Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
