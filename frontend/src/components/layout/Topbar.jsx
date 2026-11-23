import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Topbar = () => {
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
      <div className="d-flex align-items-center gap-2">
        <span className="fw-semibold text-dark" style={{ fontSize: '15px' }}>
          Sunrise Institute of Technology
        </span>
        <span className="text-muted" style={{ fontSize: '13px' }}>
          | College Portal
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <div className="text-end">
          <div className="fw-semibold" style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
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
