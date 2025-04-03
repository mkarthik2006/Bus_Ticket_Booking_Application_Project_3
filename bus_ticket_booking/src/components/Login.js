import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import {jwtDecode} from 'jwt-decode';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    apiClient.post('/api/users/login', credentials)
      .then((response) => {
        const { accessToken } = response.data;
        localStorage.setItem('token', accessToken);
        setMessage('Login successful!');
        try {
          const decoded = jwtDecode(accessToken);
          if (decoded.role === 'ADMIN' || decoded.roles?.includes('ADMIN')) {
            navigate('/admin/dashboard');
          } else {
            navigate('/user-dashboard');
          }
        } catch (error) {
          setMessage('Login successful, but failed to decode token. Redirecting to dashboard.');
          navigate('/user-dashboard');
        }
        setLoading(false);
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || 'Invalid credentials.';
        console.error("Login error:", errorMsg);
        setMessage(errorMsg);
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
            <i className="bi bi-person-circle fs-1 text-primary"></i>
            <h3 className="mt-2">Login</h3>
          </div>
          {message && <div className="alert alert-info text-center">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                <i className="bi bi-envelope me-1"></i>Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                <i className="bi bi-lock me-1"></i>Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-3 text-center">
            <small className="text-muted">
              Don't have an account? <a href="/register">Register here</a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
