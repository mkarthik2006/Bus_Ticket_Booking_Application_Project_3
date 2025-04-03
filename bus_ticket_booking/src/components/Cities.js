import React, { useEffect, useState } from 'react';
import apiClient from '../api';

const Cities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
  // For creating a new city
  const [newCity, setNewCity] = useState({ name: '' });

  // For editing an existing city
  const [editingCityId, setEditingCityId] = useState(null);
  const [editCityData, setEditCityData] = useState({ name: '' });

  // Fetch cities from /api/admin/cities
  useEffect(() => {
    apiClient.get('/api/admin/cities')
      .then(response => {
        setCities(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load cities:', err.response ? err.response.data : err);
        setError('Failed to load cities.');
        setLoading(false);
      });
  }, []);

  // Handler for new city input
  const handleNewCityChange = (e) => {
    setNewCity({ ...newCity, [e.target.name]: e.target.value });
  };

  // Submit new city
  const handleNewCitySubmit = (e) => {
    e.preventDefault();
    apiClient.post('/api/admin/cities', newCity)
      .then(response => {
        setCities(prev => [...prev, response.data]);
        setNewCity({ name: '' });
      })
      .catch(() => {
        alert('Failed to add city');
      });
  };

  // Open edit form for a city
  const handleEditClick = (city) => {
    setEditingCityId(city.id);
    setEditCityData({ name: city.name });
  };

  // Handler for editing city's name
  const handleEditChange = (e) => {
    setEditCityData({ ...editCityData, [e.target.name]: e.target.value });
  };

  // Submit edited city
  const handleEditSubmit = (e) => {
    e.preventDefault();
    apiClient.put(`/api/admin/cities/${editingCityId}`, editCityData)
      .then(response => {
        setCities(prev =>
          prev.map(c => (c.id === editingCityId ? response.data : c))
        );
        setEditingCityId(null);
      })
      .catch(() => {
        alert('Failed to update city');
      });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCityId(null);
  };

  // Delete city with enhanced error handling
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;
    apiClient.delete(`/api/admin/cities/${id}`)
      .then(() => {
        setCities(prev => prev.filter(c => c.id !== id));
        // Clear any previous deletion error.
        setDeleteError('');
      })
      .catch((err) => {
        const message = err.response?.data || '';
        if (message.includes('foreign key constraint')) {
          // Fetch buses to identify related bus IDs
          apiClient.get('/api/admin/buses')
            .then(res => {
              const relatedBuses = res.data.filter(b =>
                (b.cityFrom && b.cityFrom.id === id) ||
                (b.cityTo && b.cityTo.id === id)
              );
              if (relatedBuses.length > 0) {
                const busIds = relatedBuses.map(b => b.id).join(', ');
                setDeleteError(`Cannot delete city: It is associated with bus id(s): ${busIds}`);
              } else {
                setDeleteError('Cannot delete city: It is referenced by one or more buses.');
              }
            })
            .catch(() => {
              setDeleteError('Cannot delete city: It is referenced by one or more buses.');
            });
        } else {
          setDeleteError('Failed to delete city');
        }
      });
  };

  if (loading) {
    return <div className="container pt-5 text-center">Loading cities...</div>;
  }
  if (error) {
    return <div className="container pt-5 text-center text-danger">{error}</div>;
  }

  return (
    <div className="container pt-5">
      {/* Display deletion error message if exists */}
      {deleteError && (
        <div className="alert alert-danger" role="alert">
          {deleteError}
        </div>
      )}
      
      <h2 className="mb-4" style={{ marginTop: '30px' }}>
        <i className="bi bi-building me-2"></i>Cities Management
      </h2>

      {/* New City Form Card */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>Add New City
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleNewCitySubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">City Name</label>
              <input
                type="text"
                name="name"
                value={newCity.name}
                onChange={handleNewCityChange}
                className="form-control"
                placeholder="Enter city name"
                required
              />
            </div>
            <div className="col-md-6 d-grid">
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check2-circle me-1"></i>Add City
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cities List Card */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>Cities List
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-secondary">
                <tr>
                  <th>City ID</th>
                  <th>City Name</th>
                  <th style={{ minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map(city =>
                  editingCityId === city.id ? (
                    <tr key={city.id}>
                      <td>{city.id}</td>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={editCityData.name}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={handleEditSubmit}
                        >
                          <i className="bi bi-check2 me-1"></i>Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelEdit}
                        >
                          <i className="bi bi-x-lg me-1"></i>Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={city.id}>
                      <td>{city.id}</td>
                      <td>{city.name}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleEditClick(city)}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(city.id)}
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

export default Cities;
