import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import apiClient from '../api';
import PdfDownloadButton from './PdfDownloadButton';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);

  // Search state now uses objects for "from" and "to"
  const [search, setSearch] = useState({ from: null, to: null, date: '' });
  const navigate = useNavigate();

  // Fetch dashboard info (bookings and userName)
  useEffect(() => {
    apiClient.get('/api/user/dashboard')
      .then(response => {
        console.log("Dashboard response:", response.data);
        setBookings(response.data.bookings || []);
        setUserName(response.data.userName || '');
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching dashboard data:", error.response ? error.response.data : error.message);
        setError('Failed to load dashboard.');
        setBookings([]);
        setLoading(false);
      });
  }, []);

  // Fetch cities for the search dropdowns (using public endpoint /api/cities)
  useEffect(() => {
    apiClient.get('/api/cities')
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error("Error fetching cities:", error.response ? error.response.data : error.message);
      });
  }, []);

  // Prepare react-select options for cities
  const cityOptions = cities.map(city => ({
    value: city.id,
    label: city.name
  }));

  // Handlers for react-select fields
  const handleFromChange = (selectedOption) => {
    setSearch(prev => ({ ...prev, from: selectedOption }));
  };

  const handleToChange = (selectedOption) => {
    setSearch(prev => ({ ...prev, to: selectedOption }));
  };

  // For date input change
  const handleChange = (e) => {
    setSearch(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // On search form submit, extract the selected city names and navigate
  const handleSubmit = (e) => {
    e.preventDefault();
    const fromCity = search.from ? search.from.label : '';
    const toCity = search.to ? search.to.label : '';
    navigate(`/search?from=${fromCity}&to=${toCity}&date=${search.date}`);
  };

  // --- NEW: Edit Booking ---
  const handleEditBooking = (bookingId) => {
    navigate(`/edit-booking?bookingId=${bookingId}`);
  };

  // --- NEW: Cancel Booking ---
  const handleCancelBooking = (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
    apiClient.delete(`/api/bookings/${bookingId}`)
      .then(() => {
        alert("Booking cancelled successfully!");
        setBookings(prev => prev.filter(b => b.id !== bookingId));
      })
      .catch((error) => {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking. Please try again.");
      });
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-white pt-5"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)',
        padding: '2rem'
      }}
    >
      {/* Top heading */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">
          <i className="bi bi-speedometer2 me-2"></i>User Dashboard
        </h1>
        <p className="lead">Welcome, {userName}</p>
      </div>

      {/* Search Buses Card */}
      <div className="card shadow" style={{ maxWidth: '900px', width: '100%' }}>
        <div className="card-body p-4">
          <h3 className="mb-4 text-center">Search Buses</h3>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-4 mb-3 mb-md-0">
                <label htmlFor="from" className="form-label">
                  <i className="bi bi-geo-alt-fill me-2"></i>From
                </label>
                <Select
                  id="from"
                  name="from"
                  options={cityOptions}
                  onChange={handleFromChange}
                  placeholder="Select origin city"
                  isClearable
                  value={search.from}
                />
              </div>
              <div className="col-md-4 mb-3 mb-md-0">
                <label htmlFor="to" className="form-label">
                  <i className="bi bi-geo-alt me-2"></i>To
                </label>
                <Select
                  id="to"
                  name="to"
                  options={cityOptions}
                  onChange={handleToChange}
                  placeholder="Select destination city"
                  isClearable
                  value={search.to}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="date" className="form-label">
                  <i className="bi bi-calendar-date me-2"></i>Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={search.date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-primary px-5">
                <i className="bi bi-search me-2"></i>Search Buses
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bookings Card */}
      <div className="card shadow mt-5" style={{ maxWidth: '900px', width: '100%' }}>
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">
            <i className="bi bi-calendar-check me-2"></i>Your Bookings
          </h5>
        </div>
        <div className="card-body">
          {bookings.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-1"></i>No bookings found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Booking ID</th>
                    <th>Bus Name</th>
                    <th>Boarding</th>
                    <th>Dropping</th>
                    <th>Booking Time</th>
                    <th>Receipt</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.bus?.busName || 'N/A'}</td>
                      <td>{booking.boardingPoint}</td>
                      <td>{booking.droppingPoint}</td>
                      <td>{new Date(booking.bookingTime).toLocaleString()}</td>
                      <td>
                        <PdfDownloadButton bookingId={booking.id} userName={userName} />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEditBooking(booking.id)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <i className="bi bi-trash me-1"></i>Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
