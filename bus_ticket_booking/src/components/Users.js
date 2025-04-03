import React, { useEffect, useState } from 'react';
import apiClient from '../api';
import { jwtDecode } from 'jwt-decode';  // Use named import

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // For creating a new user – includes a password field
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: ''
  });

  // For editing an existing user
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in.');
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      // Check for ADMIN role based on token structure
      if (decoded.role === 'ADMIN' || decoded.roles?.includes('ADMIN')) {
        setIsAdmin(true);
        apiClient.get('/api/admin/users')
          .then(response => {
            setUsers(response.data);
            setLoading(false);
          })
          .catch(() => {
            setError('Failed to fetch users.');
            setLoading(false);
          });
      } else {
        setError('You are not authorized to view this page.');
        setLoading(false);
      }
    } catch (err) {
      setError('Invalid or expired token.');
      setLoading(false);
    }
  }, []);

  // Handlers for creating a new user
  const handleNewUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleNewUserSubmit = (e) => {
    e.preventDefault();
    apiClient.post('/api/admin/users', newUser)
      .then((res) => {
        setUsers(prev => [...prev, res.data]);
        setNewUser({ name: '', email: '', role: 'USER', password: '' });
      })
      .catch(() => {
        alert('Failed to create user');
      });
  };

  // Handlers for editing a user
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleEditChange = (e) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    apiClient.put(`/api/admin/users/${editingUserId}`, editUserData)
      .then((res) => {
        setUsers(prev =>
          prev.map(u => (u.id === editingUserId ? res.data : u))
        );
        setEditingUserId(null);
      })
      .catch(() => {
        alert('Failed to update user');
      });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    apiClient.delete(`/api/admin/users/${id}`)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== id));
      })
      .catch(() => {
        alert('Failed to delete user');
      });
  };

  if (loading) {
    return <div className="container pt-5 text-center">Loading users...</div>;
  }
  if (error) {
    return <div className="container pt-5 text-center text-danger">{error}</div>;
  }
  if (!isAdmin) {
    return <div className="container pt-5 text-center text-danger">Access Denied</div>;
  }

  return (
    <div className="container pt-5">
      <h2 className="mb-4" style={{ marginTop: '30px' }}>
        <i className="bi bi-people me-2"></i>All Registered Users
      </h2>
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-person-plus me-2"></i>Add New User
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleNewUserSubmit} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleNewUserChange}
                className="form-control"
                placeholder="Enter name"
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                className="form-control"
                placeholder="Enter email"
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
                className="form-select"
                required
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                className="form-control"
                placeholder="Enter password"
                required
              />
            </div>
            <div className="col-md-2 d-grid">
              <button type="submit" className="btn btn-success">
                <i className="bi bi-plus-circle me-1"></i>Create
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>Users List
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-secondary">
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user =>
                  editingUserId === user.id ? (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={editUserData.name}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          name="email"
                          value={editUserData.email}
                          onChange={handleEditChange}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select
                          name="role"
                          value={editUserData.role}
                          onChange={handleEditChange}
                          className="form-select"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
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
                      </td>
                    </tr>
                  ) : (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm me-2"
                          onClick={() => handleEditClick(user)}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(user.id)}
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

export default Users;
