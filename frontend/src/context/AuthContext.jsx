import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('cms_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Optionally verify profile
      api.get('/profile')
        .then((res) => {
          const profileData = res.data;
          setUser((prev) => ({
            ...prev,
            role: profileData.role,
            email: profileData.email,
            status: profileData.status,
            profile: profileData.details,
          }));
        })
        .catch(() => {
          // Token might be invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (authData) => {
    const { token: jwtToken, id, email, role, name, profile } = authData;
    localStorage.setItem('cms_token', jwtToken);
    const userData = { id, email, role, name, profile };
    localStorage.setItem('cms_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const updateUser = (fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('cms_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setToken(null);
    setUser(null);
  };

  const getDashboardRoute = (userRole) => {
    const r = userRole || user?.role;
    if (r === 'ADMIN') return '/admin/dashboard';
    if (r === 'FACULTY') return '/faculty/dashboard';
    if (r === 'STUDENT') return '/student/dashboard';
    return '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,
        isAuthenticated: !!token,
        loading,
        login,
        updateUser,
        logout,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
