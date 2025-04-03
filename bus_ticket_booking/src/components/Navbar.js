import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import {jwtDecode} from 'jwt-decode';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    if (token) {
      apiClient.get('/api/users/current')
        .then(response => {
          if (response.data && response.data.role) {
            setUserDetails(response.data);
          } else {
            const decoded = jwtDecode(token);
            setUserDetails(decoded);
          }
        })
        .catch(error => {
          console.error("Failed to fetch user details:", error);
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserDetails(null);
    navigate('/login');
  };

  // Determine the dashboard link based on user role.
  let dashboardLink;
  if (userDetails && userDetails.role) {
    const role = userDetails.role.toUpperCase();
    if (role === 'ADMIN') {
      dashboardLink = <NavLink className="nav-link" to="/admin/dashboard">Dashboard</NavLink>;
    } else if (role === 'USER') {
      dashboardLink = <NavLink className="nav-link" to="/user-dashboard">Dashboard</NavLink>;
    } else {
      dashboardLink = <NavLink className="nav-link" to="/guest-dashboard">Dashboard</NavLink>;
    }
  } else {
    dashboardLink = <NavLink className="nav-link" to="/guest-dashboard">Dashboard</NavLink>;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-bus-front me-2" style={{ fontSize: '1.8rem', color: '#FFA500' }}></i>
          <span className="fw-bold fs-4" style={{ color: '#FFA500' }}>ExpressBus</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {token && userDetails ? (
              <>
                <li className="nav-item me-2">
                  <span className="nav-link">
                    <i className="bi bi-person-circle me-1"></i>
                    {userDetails.name || userDetails.email}
                  </span>
                </li>
                <li className="nav-item me-2">
                  {dashboardLink}
                </li>
                <li className="nav-item">
                  <button className="btn btn-link nav-link" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    <i className="bi bi-house-door me-1"></i>Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    <i className="bi bi-person-plus me-1"></i>Register
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/guest-dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>Dashboard
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
