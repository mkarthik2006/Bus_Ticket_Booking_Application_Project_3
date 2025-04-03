import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import apiClient from '../api';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For creating a new booking
  const [newBooking, setNewBooking] = useState({
    busId: '',
    userId: '',
    boardingPoint: '',
    droppingPoint: '',
    bookingTime: ''
  });

  // For editing an existing booking
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editBookingData, setEditBookingData] = useState({
    busId: '',
    userId: '',
    boardingPoint: '',
    droppingPoint: '',
    bookingTime: ''
  });

  useEffect(() => {
    // Fetch enriched bookings (BookingResponseDto objects)
    apiClient.get('/api/admin/bookings')
      .then(response => {
        console.log("Bookings response:", response.data);
        setBookings(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err.response ? err.response.data : err);
        setError('Failed to fetch bookings.');
        setLoading(false);
      });

    // Fetch buses for dropdown list
    apiClient.get('/api/admin/buses')
      .then(response => setBuses(response.data))
      .catch(err => console.error('Failed to load buses:', err));

    // Fetch users for dropdown list
    apiClient.get('/api/admin/users')
      .then(response => setUsers(response.data))
      .catch(err => console.error('Failed to load users:', err));
  }, []);

  // Prepare react-select options for buses and users
  const busOptions = buses.map(bus => ({
    value: bus.id,
    label: `${bus.busName} (${bus.busNumber})`
  }));

  const userOptions = users.map(user => ({
    value: user.id,
    label: user.name
  }));

  // Handlers for new booking form
  const handleNewBookingChange = (e) => {
    setNewBooking({ ...newBooking, [e.target.name]: e.target.value });
  };

  const handleNewBookingSelectChange = (selectedOption, { name }) => {
    if (name === 'busId') {
      setNewBooking({ ...newBooking, busId: selectedOption ? selectedOption.value : '' });
    } else if (name === 'userId') {
      setNewBooking({ ...newBooking, userId: selectedOption ? selectedOption.value : '' });
    }
  };

  const handleNewBookingSubmit = (e) => {
    e.preventDefault();
    apiClient.post('/api/admin/bookings', newBooking)
      .then(response => {
        console.log("Created booking:", response.data);
        // Re-fetch bookings to update enriched list
        apiClient.get('/api/admin/bookings')
          .then(resp => setBookings(resp.data))
          .catch(err => console.error('Error re-fetching bookings:', err));
        setNewBooking({
          busId: '',
          userId: '',
          boardingPoint: '',
          droppingPoint: '',
          bookingTime: ''
        });
      })
      .catch(() => {
        alert('Failed to create booking');
      });
  };

  // Handlers for editing a booking
  const handleEditClick = (booking) => {
    setEditingBookingId(booking.id);
    const formattedBookingTime = booking.bookingTime
      ? new Date(booking.bookingTime).toISOString().slice(0, 16)
      : '';
    setEditBookingData({
      busId: booking.busId,
      userId: booking.userId,
      boardingPoint: booking.boardingPoint,
      droppingPoint: booking.droppingPoint,
      bookingTime: formattedBookingTime
    });
  };

  const handleEditChange = (e) => {
    setEditBookingData({ ...editBookingData, [e.target.name]: e.target.value });
  };

  const handleEditSelectChange = (selectedOption, { name }) => {
    if (name === 'busId') {
      setEditBookingData({ ...editBookingData, busId: selectedOption ? selectedOption.value : '' });
    } else if (name === 'userId') {
      setEditBookingData({ ...editBookingData, userId: selectedOption ? selectedOption.value : '' });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    apiClient.put(`/api/admin/bookings/${editingBookingId}`, editBookingData)
      .then(response => {
        console.log("Updated booking:", response.data);
        setBookings(prev =>
          prev.map(b => (b.id === editingBookingId ? response.data : b))
        );
        setEditingBookingId(null);
      })
      .catch(() => {
        alert('Failed to update booking');
      });
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
  };

  // Handler for deleting a booking
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    apiClient.delete(`/api/admin/bookings/${id}`)
      .then(() => {
        setBookings(prev => prev.filter(b => b.id !== id));
      })
      .catch(() => {
        alert('Failed to delete booking');
      });
  };

  if (loading) {
    return <div className="container pt-5 text-center">Loading bookings...</div>;
  }
  if (error) {
    return <div className="container pt-5 text-center text-danger">{error}</div>;
  }

  return (
    <div className="container pt-5">
      <h2 className="mb-4" style={{ marginTop: '30px' }}>
        <i className="bi bi-calendar-check me-2"></i>Bookings Management
      </h2>

      {/* New Booking Form */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>Add New Booking
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleNewBookingSubmit} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Bus</label>
              <Select
                name="busId"
                options={busOptions}
                onChange={handleNewBookingSelectChange}
                placeholder="Select Bus"
                isClearable
                value={busOptions.find(option => option.value === newBooking.busId) || null}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">User</label>
              <Select
                name="userId"
                options={userOptions}
                onChange={handleNewBookingSelectChange}
                placeholder="Select User"
                isClearable
                value={userOptions.find(option => option.value === newBooking.userId) || null}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Boarding</label>
              <input
                type="text"
                name="boardingPoint"
                value={newBooking.boardingPoint}
                onChange={handleNewBookingChange}
                className="form-control"
                placeholder="Boarding point"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Dropping</label>
              <input
                type="text"
                name="droppingPoint"
                value={newBooking.droppingPoint}
                onChange={handleNewBookingChange}
                className="form-control"
                placeholder="Dropping point"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Booking Time</label>
              <input
                type="datetime-local"
                name="bookingTime"
                value={newBooking.bookingTime}
                onChange={handleNewBookingChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-1 d-grid">
              <button type="submit" className="btn btn-success">
                <i className="bi bi-plus-circle me-1"></i>Create
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bookings List */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>Bookings List
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-secondary">
                <tr>
                  <th>Booking ID</th>
                  <th>Bus</th>
                  <th>User</th>
                  <th>Boarding</th>
                  <th>Dropping</th>
                  <th>Booking Time</th>
                  <th style={{ minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking =>
                  editingBookingId === booking.id ? (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>
                        <Select
                          name="busId"
                          options={busOptions}
                          onChange={handleEditSelectChange}
                          placeholder="Select Bus"
                          isClearable
                          value={busOptions.find(option => option.value === editBookingData.busId) || null}
                        />
                      </td>
                      <td>
                        <Select
                          name="userId"
                          options={userOptions}
                          onChange={handleEditSelectChange}
                          placeholder="Select User"
                          isClearable
                          value={userOptions.find(option => option.value === editBookingData.userId) || null}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="boardingPoint"
                          value={editBookingData.boardingPoint}
                          onChange={handleEditChange}
                          className="form-control"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="droppingPoint"
                          value={editBookingData.droppingPoint}
                          onChange={handleEditChange}
                          className="form-control"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          name="bookingTime"
                          value={editBookingData.bookingTime}
                          onChange={handleEditChange}
                          className="form-control"
                          required
                        />
                      </td>
                      <td>
                        <button className="btn btn-success btn-sm me-2" onClick={handleEditSubmit}>
                          <i className="bi bi-check me-1"></i>Save
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>
                          <i className="bi bi-x-lg me-1"></i>Cancel
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.busName} ({booking.busNumber})</td>
                      <td>{booking.userName}</td>
                      <td>{booking.boardingPoint}</td>
                      <td>{booking.droppingPoint}</td>
                      <td>{booking.bookingTime}</td>
                      <td>
                        <button className="btn btn-primary btn-sm me-2" onClick={() => handleEditClick(booking)}>
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(booking.id)}>
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

export default BookingsManagement;
