import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';

const Register = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    apiClient.post('/api/users/register', user)
      .then(() => {
        setMessage('Registration successful!');
        setLoading(false);
        // Redirect to login page after successful registration
        navigate('/login');
      })
      .catch(() => {
        setMessage('Registration failed.');
        setLoading(false);
      });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(90deg, #4e54c8, #8f94fb)'
      }}
    >
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-person-plus-fill fs-1 text-primary"></i>
            <h3 className="mt-2">Register</h3>
          </div>
          {message && <div className="alert alert-info text-center">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                <i className="bi bi-person-fill me-1"></i>Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={user.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <i className="bi bi-envelope-fill me-1"></i>Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={user.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                <i className="bi bi-lock-fill me-1"></i>Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter a secure password"
                value={user.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                <i className="bi bi-shield-lock-fill me-1"></i>Role
              </label>
              <select
                id="role"
                name="role"
                value={user.role}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="mt-3 text-center">
            <small className="text-muted">
              Already have an account? <a href="/login">Login here</a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
