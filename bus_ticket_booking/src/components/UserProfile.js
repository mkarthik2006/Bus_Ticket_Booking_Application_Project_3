// src/components/UserProfile.js
import React, { useEffect, useState } from 'react';
import apiClient from '../api';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/api/users/current')
      .then(response => {
        setProfile(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load profile.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container text-center mt-5">Loading profile...</div>;
  if (error) return <div className="container text-center mt-5 text-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <h2>User Profile</h2>
      <div className="card">
        <div className="card-body">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          {/* Add additional fields as needed */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
