import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import apiClient from '../api';

const Home = () => {
  // Search state now stores objects for "from" and "to"
  const [search, setSearch] = useState({ from: null, to: null, date: '' });
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to Bus Ticket Booking');
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  // Load welcome message (optional)
  useEffect(() => {
    apiClient.get('/api/view/')
      .then(response => {
        if (response.data.message) {
          setWelcomeMessage(response.data.message);
        }
      })
      .catch(error => {
        console.error('Error fetching welcome message:', error);
      });
  }, []);

  // Load cities for dropdowns
  useEffect(() => {
    apiClient.get('/api/cities')
      .then(response => {
        setCities(response.data);
      })
      .catch(error => {
        console.error('Error fetching cities:', error);
      });
  }, []);

  // Prepare react-select options from cities array
  const cityOptions = cities.map(city => ({
    value: city.id,
    label: city.name
  }));

  // Handlers for react-select dropdowns
  const handleFromChange = (selectedOption) => {
    setSearch(prev => ({ ...prev, from: selectedOption }));
  };

  const handleToChange = (selectedOption) => {
    setSearch(prev => ({ ...prev, to: selectedOption }));
  };

  // Handler for date input change remains unchanged
  const handleDateChange = (e) => {
    setSearch(prev => ({ ...prev, date: e.target.value }));
  };

  // On form submit, extract the selected city names and navigate to the search page.
  const handleSubmit = (e) => {
    e.preventDefault();
    const fromCity = search.from ? search.from.label : '';
    const toCity = search.to ? search.to.label : '';
    navigate(`/search?from=${fromCity}&to=${toCity}&date=${search.date}`);
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-white"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
        padding: '2rem'
      }}
    >
      <div className="container text-center">
        <h1 className="display-3 fw-bold mb-3">
          <i className="bi bi-bus-front me-2"></i>{welcomeMessage}
        </h1>
        <p className="lead mb-4">
          Discover the best routes and unbeatable fares for your journey.
        </p>
        <div className="card bg-light shadow-sm mx-auto" style={{ maxWidth: '900px' }}>
          <div className="card-body p-4">
            <h3 className="card-title mb-4 text-dark">
              <i className="bi bi-search me-2"></i>Search Buses
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="from" className="form-label text-dark">
                    <i className="bi bi-geo-alt-fill me-1"></i>From
                  </label>
                  <Select
                    id="from"
                    name="from"
                    options={cityOptions}
                    onChange={handleFromChange}
                    placeholder="Select origin city"
                    isClearable
                    className="basic-single"
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="to" className="form-label text-dark">
                    <i className="bi bi-geo-alt me-1"></i>To
                  </label>
                  <Select
                    id="to"
                    name="to"
                    options={cityOptions}
                    onChange={handleToChange}
                    placeholder="Select destination city"
                    isClearable
                    className="basic-single"
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="date" className="form-label text-dark">
                    <i className="bi bi-calendar-date me-1"></i>Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={search.date}
                    onChange={handleDateChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <button type="submit" className="btn btn-primary btn-lg">
                  <i className="bi bi-search me-2"></i>Find Buses
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-5">
          <p className="fs-5">
            <i className="bi bi-info-circle me-2"></i>Plan your trip quickly with our easy-to-use search and booking system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
