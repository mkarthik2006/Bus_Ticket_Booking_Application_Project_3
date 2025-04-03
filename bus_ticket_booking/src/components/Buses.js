import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import apiClient from '../api';

const BusesManagement = () => {
  const [buses, setBuses] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For creating a new bus
  const [newBus, setNewBus] = useState({
    busName: '',
    busNumber: '',
    price: '',
    departure: '',
    arrival: '',
    cityFromId: '', // Will serve as "Route From"
    cityToId: ''    // Will serve as "Route To"
  });

  // For editing an existing bus
  const [editingBusId, setEditingBusId] = useState(null);
  const [editBusData, setEditBusData] = useState({
    busName: '',
    busNumber: '',
    price: '',
    departure: '',
    arrival: '',
    cityFromId: '',
    cityToId: ''
  });

  useEffect(() => {
    // Fetch all buses
    apiClient.get('/api/admin/buses')
      .then(response => {
        setBuses(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch buses:', err.response ? err.response.data : err);
        setError('Failed to fetch buses.');
        setLoading(false);
      });
      
    // Fetch cities for dropdown
    apiClient.get('/api/admin/cities')
      .then(response => setCities(response.data))
      .catch(err => console.error('Failed to load cities:', err));
  }, []);

  // Prepare city options for react-select
  const cityOptions = cities.map(city => ({
    value: city.id,
    label: city.name
  }));

  // Handlers for the new bus form
  const handleNewBusChange = (e) => {
    setNewBus({ ...newBus, [e.target.name]: e.target.value });
  };

  // For city dropdowns in the new bus form
  const handleNewBusSelectChange = (selectedOption, { name }) => {
    setNewBus({ ...newBus, [name]: selectedOption ? selectedOption.value : '' });
  };

  const handleNewBusSubmit = (e) => {
    e.preventDefault();
    apiClient.post('/api/admin/buses', newBus)
      .then(response => {
        setBuses(prev => [...prev, response.data]);
        // Reset the new bus form
        setNewBus({
          busName: '',
          busNumber: '',
          price: '',
          departure: '',
          arrival: '',
          cityFromId: '',
          cityToId: ''
        });
      })
      .catch(() => {
        alert('Failed to create bus');
      });
  };

  // Handlers for editing an existing bus
  const handleEditClick = (bus) => {
    setEditingBusId(bus.id);
    setEditBusData({
      busName: bus.busName,
      busNumber: bus.busNumber,
      price: bus.price,
      departure: bus.departureTime, // Must be acceptable for datetime-local
      arrival: bus.arrivalTime,
      cityFromId: bus.cityFrom ? bus.cityFrom.id : '',
      cityToId: bus.cityTo ? bus.cityTo.id : ''
    });
  };

  const handleEditChange = (e) => {
    setEditBusData({ ...editBusData, [e.target.name]: e.target.value });
  };

  // For city dropdowns in the edit form
  const handleEditSelectChange = (selectedOption, { name }) => {
    setEditBusData({ ...editBusData, [name]: selectedOption ? selectedOption.value : '' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    apiClient.put(`/api/admin/buses/${editingBusId}`, editBusData)
      .then(response => {
        // Update the buses list with the edited bus
        setBuses(prev => prev.map(b => (b.id === editingBusId ? response.data : b)));
        setEditingBusId(null);
      })
      .catch(() => {
        alert('Failed to update bus');
      });
  };

  const handleCancelEdit = () => {
    setEditingBusId(null);
  };

  // Delete bus
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    apiClient.delete(`/api/admin/buses/${id}`)
      .then(() => {
        setBuses(prev => prev.filter(b => b.id !== id));
      })
      .catch(() => {
        alert('Failed to delete bus');
      });
  };

  if (loading) {
    return <div className="container pt-5 text-center">Loading buses...</div>;
  }
  if (error) {
    return <div className="container pt-5 text-center text-danger">{error}</div>;
  }

  return (
    <div className="container pt-5">
      {/* Page Heading */}
      <h2 className="mb-4 text-center" style={{ marginTop: '30px' }}>
        <i className="bi bi-train-front me-2"></i>Buses Management
      </h2>

      {/* New Bus Form */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>Add New Bus
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleNewBusSubmit} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Bus Name</label>
              <input
                type="text"
                name="busName"
                value={newBus.busName}
                onChange={handleNewBusChange}
                className="form-control"
                placeholder="Enter bus name"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Bus Number</label>
              <input
                type="text"
                name="busNumber"
                value={newBus.busNumber}
                onChange={handleNewBusChange}
                className="form-control"
                placeholder="Enter bus number"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Price</label>
              <input
                type="number"
                name="price"
                value={newBus.price}
                onChange={handleNewBusChange}
                className="form-control"
                placeholder="Enter price"
                required
              />
            </div>

            {/* Route From / Route To (Cities) */}
            <div className="col-md-6">
              <label className="form-label">Route From</label>
              <Select
                name="cityFromId"
                options={cityOptions}
                onChange={handleNewBusSelectChange}
                placeholder="Select City"
                isClearable
                value={cityOptions.find(option => option.value === newBus.cityFromId) || null}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Route To</label>
              <Select
                name="cityToId"
                options={cityOptions}
                onChange={handleNewBusSelectChange}
                placeholder="Select City"
                isClearable
                value={cityOptions.find(option => option.value === newBus.cityToId) || null}
              />
            </div>

            {/* Departure / Arrival */}
            <div className="col-md-6">
              <label className="form-label">Departure</label>
              <input
                type="datetime-local"
                name="departure"
                value={newBus.departure}
                onChange={handleNewBusChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Arrival</label>
              <input
                type="datetime-local"
                name="arrival"
                value={newBus.arrival}
                onChange={handleNewBusChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-12 d-grid">
              <button type="submit" className="btn btn-success">
                <i className="bi bi-plus-circle me-1"></i>Create Bus
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Buses List */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>Buses List
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-secondary">
                <tr>
                  <th>ID</th>
                  <th>Bus Name</th>
                  <th>Bus Number</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Price</th>
                  <th style={{ minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map(bus =>
                  editingBusId === bus.id ? (
                    <tr key={bus.id}>
                      <td>{bus.id}</td>
                      <td>
                        <input
                          type="text"
                          name="busName"
                          value={editBusData.busName}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="busNumber"
                          value={editBusData.busNumber}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        {/* City From / City To as route */}
                        <div className="mb-1">
                          <Select
                            name="cityFromId"
                            options={cityOptions}
                            onChange={handleEditSelectChange}
                            placeholder="From"
                            isClearable
                            value={cityOptions.find(option => option.value === editBusData.cityFromId) || null}
                          />
                        </div>
                        <div>
                          <Select
                            name="cityToId"
                            options={cityOptions}
                            onChange={handleEditSelectChange}
                            placeholder="To"
                            isClearable
                            value={cityOptions.find(option => option.value === editBusData.cityToId) || null}
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          name="departure"
                          value={editBusData.departure}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          name="arrival"
                          value={editBusData.arrival}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="price"
                          value={editBusData.price}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <div className="d-flex flex-column flex-sm-row">
                          <button
                            className="btn btn-success btn-sm me-sm-2 mb-2 mb-sm-0"
                            onClick={handleEditSubmit}
                          >
                            <i className="bi bi-check me-1"></i>Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleCancelEdit}
                          >
                            <i className="bi bi-x-lg me-1"></i>Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={bus.id}>
                      <td>{bus.id}</td>
                      <td>{bus.busName}</td>
                      <td>{bus.busNumber}</td>
                      <td>
                        {bus.cityFrom?.name} → {bus.cityTo?.name}
                      </td>
                      <td>{bus.departureTime}</td>
                      <td>{bus.arrivalTime}</td>
                      <td>{bus.price}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleEditClick(bus)}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(bus.id)}
                        >
                          <i className="bi bi-trash me-1"></i>Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusesManagement;
