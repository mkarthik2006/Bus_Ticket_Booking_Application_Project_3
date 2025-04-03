
import React, { useState } from 'react';
import apiClient from '../api';

const AddPassenger = () => {
  const [passenger, setPassenger] = useState({ name: '', age: '', gender: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setPassenger({ ...passenger, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
   
    apiClient.post('/booking/addPassenger', passenger)
      .then(() => {
        setMessage('Passenger added successfully!');
        setLoading(false);
      })
      .catch(() => {
        setMessage('Error adding passenger.');
        setLoading(false);
      });
  };

  return (
    <div className="container mt-5">
      <h2>Add Passenger</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" value={passenger.name} onChange={handleChange} className="form-control" required />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input type="number" id="age" name="age" value={passenger.age} onChange={handleChange} className="form-control" required />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={passenger.gender} onChange={handleChange} className="form-control" required>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Passenger'}
        </button>
      </form>
    </div>
  );
};

export default AddPassenger;
