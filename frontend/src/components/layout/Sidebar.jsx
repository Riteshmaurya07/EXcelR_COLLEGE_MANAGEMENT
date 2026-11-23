import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/faculties', label: 'Faculty & Admins' },
    { to: '/admin/courses', label: 'Courses' },
    { to: '/admin/reports', label: 'Attendance Reports' },
    { to: '/admin/sessions', label: 'Academic Sessions' },
    { to: '/profile', label: 'My Profile' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/courses', label: 'Courses & Enrolment' },
    { to: '/student/attendance', label: 'My Attendance' },
    { to: '/student/timetable', label: 'Class Timetable' },
    { to: '/student/faculties', label: 'Course Instructors' },
    { to: '/profile', label: 'My Profile' },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard' },
    { to: '/faculty/courses', label: 'My Courses' },
    { to: '/faculty/students', label: 'Enrolled Students' },
    { to: '/faculty/attendance', label: 'Mark & View Attendance' },
    { to: '/profile', label: 'My Profile' },
  ];

  let links = [];
  if (role === 'ADMIN') links = adminLinks;
  else if (role === 'FACULTY') links = facultyLinks;
  else if (role === 'STUDENT') links = studentLinks;

  return (
    <aside className={`sidebar-nav d-flex flex-column ${isOpen ? 'mobile-open' : ''}`}>
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div>
          <div className="fw-bold text-white fs-6">Sunrise Institute</div>
          <div className="text-white-50" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
            COLLEGE MANAGEMENT
          </div>
        </div>
        {/* Mobile close button */}
        <button
          type="button"
          className="btn-close btn-close-white d-lg-none"
          onClick={onClose}
          aria-label="Close menu"
          style={{ fontSize: '11px' }}
        />
      </div>
      <div className="p-2 flex-grow-1">
        <ul className="nav flex-column gap-1">
          {links.map((link) => (
            <li className="nav-item" key={link.to}>
              <NavLink
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-link px-3 py-2 rounded text-white ${
                    isActive ? 'fw-semibold' : 'text-white-50'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  fontSize: '13px',
                })}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
        Sunrise Institute of Technology<br />Autonomous Institution
      </div>
    </aside>
  );
};

export default Sidebar;
