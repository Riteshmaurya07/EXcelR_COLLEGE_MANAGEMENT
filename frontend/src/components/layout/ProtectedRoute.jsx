import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from './Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading, getDashboardRoute } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user has wrong role, redirect to their own dashboard per Step 3 requirement
    return <Navigate to={getDashboardRoute(role)} replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
