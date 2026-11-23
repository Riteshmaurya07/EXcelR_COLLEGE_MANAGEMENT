import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeClass = () => {
    if (role === 'ADMIN') return 'badge bg-dark';
    if (role === 'FACULTY') return 'badge bg-secondary';
    return 'badge bg-primary';
  };

  return (
    <header className="topbar-header">
      <div className="d-flex align-items-center">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="btn btn-sm btn-light border d-lg-none me-2 d-flex align-items-center justify-content-center"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          style={{ width: '34px', height: '34px', padding: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="d-flex align-items-center gap-1">
          <span className="fw-semibold text-dark text-truncate" style={{ fontSize: '15px', maxWidth: '180px' }}>
            Sunrise Institute
          </span>
          <span className="text-muted d-none d-sm-inline" style={{ fontSize: '13px' }}>
            | College Portal
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 gap-sm-3">
        <div className="text-end d-none d-sm-block">
          <div className="fw-semibold text-truncate" style={{ fontSize: '13px', color: 'var(--color-primary)', maxWidth: '140px' }}>
            {user?.name || user?.email || 'User'}
          </div>
          <div className="d-flex align-items-center justify-content-end gap-1">
            <span className={roleBadgeClass()} style={{ fontSize: '10px' }}>
              {role}
            </span>
          </div>
        </div>
        <Link to="/profile" className="btn btn-sm btn-outline-secondary py-1 px-2" style={{ fontSize: '12px' }}>
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="btn btn-sm btn-outline-danger py-1 px-2"
          style={{ fontSize: '12px' }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
