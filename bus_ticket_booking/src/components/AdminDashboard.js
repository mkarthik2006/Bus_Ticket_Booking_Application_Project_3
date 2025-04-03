
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalUsers: 0,
    totalBookings: 0,
  });
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(true);

  
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cities, setCities] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);

 
  const [selectedManagement, setSelectedManagement] = useState(null);

  useEffect(() => {
    
    apiClient.get('/api/admin/dashboard')
      .then(response => {
        setAdminName(response.data.adminName);
        setStats(response.data.stats);
        setBuses(response.data.buses);
      })
      .catch(error => {
        console.error('Failed to fetch dashboard data:', error.response ? error.response.data : error);
      });

   
    Promise.all([
      apiClient.get('/api/admin/bookings'),
      apiClient.get('/api/admin/cities'),
      apiClient.get('/api/admin/users'),
      apiClient.get('/api/admin/payments')
    ])
      .then(([bookingsRes, citiesRes, usersRes, paymentsRes]) => {
        setBookings(bookingsRes.data);
        setCities(citiesRes.data);
        setUsers(usersRes.data);
        setPayments(paymentsRes.data);
      })
      .catch(error => {
        console.error('Error fetching management lists:', error.response ? error.response.data : error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBack = () => {
    setSelectedManagement(null);
  };

  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <h4>Loading dashboard data...</h4>
      </div>
    );
  }

  
  const renderBusesTable = () => (
    <div className="card shadow mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0"><i className="bi bi-train-front me-2"></i>Buses List</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Bus ID</th>
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
                  <td>{bus.id}</td>
                  <td>{bus.busName}</td>
                  <td>{bus.busNumber}</td>
                  <td>{bus.routeFrom} → {bus.routeTo}</td>
                  <td>{bus.departureTime}</td>
                  <td>{bus.arrivalTime}</td>
                  <td>{bus.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>
    </div>
  );

  const renderBookingsTable = () => (
    <div className="card shadow mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0"><i className="bi bi-calendar-check me-2"></i>Bookings List</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Booking ID</th>
                <th>Bus ID</th>
                <th>User ID</th>
                <th>Boarding</th>
                <th>Dropping</th>
                <th>Booking Time</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.bus?.id}</td>
                  <td>{booking.user?.id}</td>
                  <td>{booking.boardingPoint}</td>
                  <td>{booking.droppingPoint}</td>
                  <td>{booking.bookingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>
    </div>
  );

  const renderCitiesTable = () => (
    <div className="card shadow mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0"><i className="bi bi-building me-2"></i>Cities List</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>City ID</th>
                <th>City Name</th>
              </tr>
            </thead>
            <tbody>
              {cities.map(city => (
                <tr key={city.id}>
                  <td>{city.id}</td>
                  <td>{city.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>
    </div>
  );

  const renderUsersTable = () => (
    <div className="card shadow mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0"><i className="bi bi-people me-2"></i>Users List</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>
    </div>
  );

  const renderPaymentsTable = () => (
    <div className="card shadow mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0"><i className="bi bi-cash-stack me-2"></i>Payments List</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-bordered table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>Payment ID</th>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.transactionId}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn btn-outline-secondary" onClick={handleBack}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
      </div>
    </div>
  );

  // Render the "All Management Items" card if no category is selected
  const renderManagementCard = () => (
    <div className="card shadow mb-4">
      <div className="card-header bg-dark text-white">
        <h5 className="mb-0">
          <i className="bi bi-folder2-open me-2"></i>All Management Items
        </h5>
      </div>
      <div className="card-body">
        <div className="list-group">
          <button
            className="list-group-item list-group-item-action"
            onClick={() => setSelectedManagement('buses')}
          >
            <i className="bi bi-train-front me-2"></i>Manage Buses
          </button>
          <button
            className="list-group-item list-group-item-action"
            onClick={() => setSelectedManagement('cities')}
          >
            <i className="bi bi-building me-2"></i>Manage Cities
          </button>
          <button
            className="list-group-item list-group-item-action"
            onClick={() => setSelectedManagement('bookings')}
          >
            <i className="bi bi-calendar-check me-2"></i>Manage Bookings
          </button>
          <button
            className="list-group-item list-group-item-action"
            onClick={() => setSelectedManagement('users')}
          >
            <i className="bi bi-people me-2"></i>Manage Users
          </button>
          <button
            className="list-group-item list-group-item-action"
            onClick={() => setSelectedManagement('payments')}
          >
            <i className="bi bi-cash-stack me-2"></i>Manage Payments
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Navbar / Header */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#0d6efd' }}>
        <div className="container-fluid">
          <span className="navbar-brand">Admin Dashboard</span>
          <div className="ms-auto">
            <span className="navbar-text text-white me-3">
              <i className="bi bi-person-circle me-1"></i>{adminName}
            </span>
            {/* Use handleLogout function for logout */}
            <button onClick={handleLogout} className="btn btn-outline-light">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        {/* Stats Row */}
        <div className="row text-center">
          <div className="col-12 col-md-4 mb-3">
            <div className="card bg-info text-white shadow">
              <div className="card-body">
                <h5 className="card-title">Total Buses</h5>
                <h2>{stats.totalBuses}</h2>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <div className="card bg-success text-white shadow">
              <div className="card-body">
                <h5 className="card-title">Total Users</h5>
                <h2>{stats.totalUsers}</h2>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4 mb-3">
            <div className="card bg-warning text-dark shadow">
              <div className="card-body">
                <h5 className="card-title">Total Bookings</h5>
                <h2>{stats.totalBookings}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="mt-4 mb-3">
          <h4>
            <i className="bi bi-lightning-charge-fill me-2"></i>Quick Admin Actions
          </h4>
          <div className="d-flex flex-wrap">
            <Link to="/admin/buses" className="btn btn-primary me-2 mb-2">
              <i className="bi bi-train-front me-1"></i>Manage Buses
            </Link>
            <Link to="/admin/cities" className="btn btn-secondary me-2 mb-2">
              <i className="bi bi-building me-1"></i>Manage Cities
            </Link>
            <Link to="/admin/bookings" className="btn btn-success me-2 mb-2">
              <i className="bi bi-calendar-check me-1"></i>Manage Bookings
            </Link>
            <Link to="/admin/users" className="btn btn-warning me-2 mb-2">
              <i className="bi bi-people me-1"></i>Manage Users
            </Link>
            <Link to="/admin/payments" className="btn btn-info me-2 mb-2">
              <i className="bi bi-cash-stack me-1"></i>Manage Payments
            </Link>
          </div>
        </div>

        {/* All Management Items Section */}
        {selectedManagement ? (
          <>
            {selectedManagement === 'buses' && renderBusesTable()}
            {selectedManagement === 'bookings' && renderBookingsTable()}
            {selectedManagement === 'cities' && renderCitiesTable()}
            {selectedManagement === 'users' && renderUsersTable()}
            {selectedManagement === 'payments' && renderPaymentsTable()}
          </>
        ) : (
          renderManagementCard()
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
