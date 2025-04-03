// src/components/SearchResults.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fromCity = searchParams.get('from');
  const toCity = searchParams.get('to');
  const travelDate = searchParams.get('date');

  useEffect(() => {
    apiClient
      .get(`/api/buses/search?from=${fromCity}&to=${toCity}&date=${travelDate}`)
      .then((response) => {
        setBuses(response.data);
      })
      .catch(() => {
        setError('Failed to fetch bus data.');
      });
  }, [fromCity, toCity, travelDate]);

  // Navigate to booking page with bus id as query parameter
  const handleBook = (busId) => {
    navigate(`/booking?busId=${busId}`);
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-white"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)',
        padding: '2rem'
      }}
    >
      <div className="card shadow" style={{ width: '100%', maxWidth: '900px' }}>
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">
            <i className="bi bi-bus-front me-2"></i>
            Available Buses
          </h4>
        </div>
        <div className="card-body">
          <h6 className="text-muted mb-4">
            From: <strong>{fromCity}</strong> | To: <strong>{toCity}</strong> | Date: <strong>{travelDate}</strong>
          </h6>

          {error && <div className="alert alert-danger">{error}</div>}

          {buses.length === 0 && !error ? (
            <div className="text-center text-muted">No buses found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Bus Name</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus) => (
                    <tr key={bus.id}>
                      <td>{bus.busName}</td>
                      <td>{bus.routeFrom} - {bus.routeTo}</td>
                      <td>{bus.departureTime}</td>
                      <td>{bus.arrivalTime}</td>
                      <td>{bus.price}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleBook(bus.id)}
                        >
                          Book
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

export default SearchResults;
