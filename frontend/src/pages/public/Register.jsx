import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rollNo: '',
    department: 'CSE',
    semester: 1,
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        ...formData,
        semester: parseInt(formData.semester, 10),
      });
      login(res.data);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container py-5 my-auto" style={{ maxWidth: '560px' }}>
        <div className="card shadow-none border">
          <div className="card-header text-center py-3 bg-white border-bottom">
            <h2 className="h5 fw-bold mb-1">New Student Registration</h2>
            <div className="text-muted small">Sunrise Institute of Technology</div>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    className="form-control"
                    placeholder="e.g. Rahul"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    className="form-control"
                    placeholder="e.g. Verma"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="email">Institutional Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="rahul.verma@student.college.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="rollNo">Roll Number</label>
                  <input
                    id="rollNo"
                    type="text"
                    name="rollNo"
                    className="form-control"
                    placeholder="e.g. CSE-2023-099"
                    value={formData.rollNo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="ME">Mechanical (ME)</option>
                    <option value="CE">Civil (CE)</option>
                    <option value="EE">Electrical (EE)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="semester">Current Semester</label>
                  <select
                    id="semester"
                    name="semester"
                    className="form-select"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mt-4"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>

            <div className="text-center pt-3 border-top mt-4" style={{ fontSize: '13px' }}>
              <span className="text-muted">Already registered? </span>
              <Link to="/login" className="fw-semibold text-decoration-none">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
