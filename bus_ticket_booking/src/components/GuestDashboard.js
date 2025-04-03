import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';

const GuestDashboard = () => {
  const [buses, setBuses] = useState([]);
  const [featuredRoutes, setFeaturedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState({ from: '', to: '', date: '' });
  const navigate = useNavigate();

  // Fetch available buses
  useEffect(() => {
    apiClient.get('/api/buses')
      .then(response => {
        setBuses(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load buses:', err.response ? err.response.data : err);
        setError('Failed to load buses.');
        setLoading(false);
      });
  }, []);

  // Fetch featured routes; skip if unauthorized
  useEffect(() => {
    apiClient.get('/api/featured-routes')
      .then(response => {
        setFeaturedRoutes(response.data);
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          console.warn('Featured routes endpoint returned 401. Skipping featured routes.');
          setFeaturedRoutes([]);
        } else {
          console.error('Error fetching featured routes:', err);
        }
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?from=${search.from}&to=${search.to}&date=${search.date}`);
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(90deg, #4e54c8, #8f94fb)' }}>
      <div className="container pt-5 mt-5">
        {/* Header */}
        <div className="text-center text-white mb-5">
          <h1 className="display-4 fw-bold">
            <i className="bi bi-speedometer2 me-2"></i>Guest Dashboard
          </h1>
          <p className="lead">Welcome, Guest! Explore bus routes and plan your journey.</p>
        </div>
        
        {/* Search Buses Card */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">
              <i className="bi bi-search me-2"></i>Search Buses
            </h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSearchSubmit} className="row g-3">
              <div className="col-md-4">
                <label htmlFor="from" className="form-label">
                  <i className="bi bi-geo-alt-fill me-1"></i>From
                </label>
                <input
                  type="text"
                  id="from"
                  name="from"
                  value={search.from}
                  onChange={handleSearchChange}
                  className="form-control"
                  placeholder="Enter origin city"
                  required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="to" className="form-label">
                  <i className="bi bi-geo-alt me-1"></i>To
                </label>
                <input
                  type="text"
                  id="to"
                  name="to"
                  value={search.to}
                  onChange={handleSearchChange}
                  className="form-control"
                  placeholder="Enter destination city"
                  required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="date" className="form-label">
                  <i className="bi bi-calendar-date me-1"></i>Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={search.date}
                  onChange={handleSearchChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-12 text-center">
                <button type="submit" className="btn btn-success btn-lg mt-3">
                  <i className="bi bi-search me-2"></i>Find Buses
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Featured Routes Card */}
        {featuredRoutes.length > 0 && (
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">
                <i className="bi bi-star me-2"></i>Featured Routes
              </h4>
            </div>
            <div className="card-body">
              <ul className="list-group">
                {featuredRoutes.map((route, index) => (
                  <li key={index} className="list-group-item">
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    {route.from} → {route.to} {route.discount ? `(${route.discount}% off)` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* Available Buses Card */}
        <div className="card shadow-sm">
          <div className="card-header bg-secondary text-white">
            <h4 className="mb-0">
              <i className="bi bi-bus-front me-2"></i>Available Buses
            </h4>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">{error}</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Bus Name</th>
                      <th>Bus Number</th>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Arrival</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map(bus => (
                      <tr key={bus.id}>
                        <td>{bus.busName}</td>
                        <td>{bus.busNumber}</td>
                        <td>{bus.routeFrom} - {bus.routeTo}</td>
                        <td>{bus.departureTime}</td>
                        <td>{bus.arrivalTime}</td>
                        <td>{bus.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;
