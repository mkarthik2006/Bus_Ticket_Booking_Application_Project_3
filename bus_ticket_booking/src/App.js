import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import Buses from './components/Buses';
import NewBus from './components/NewBus';       
import EditBus from './components/EditBus';    
import Cities from './components/Cities';
import NewCity from './components/NewCity';    
import Booking from './components/Booking';
import Bookings from './components/Bookings';
import Payment from './components/Payment';
import Payments from './components/Payments';
import SearchResults from './components/SearchResults';
import SeatSelection from './components/SeatSelection';
import UserDashboard from './components/UserDashboard';
import UserProfile from './components/UserProfile';
import Users from './components/Users';
import GuestDashboard from './components/GuestDashboard';

const SeatSelectionWrapper = () => {
  const { busId } = useParams();
  return <SeatSelection busId={busId} />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/seat-selection/:busId" element={<SeatSelectionWrapper />} />
        <Route path="/guest-dashboard" element={<GuestDashboard />} />

        {/* User Routes */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-profile" element={<UserProfile />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/buses" element={<Buses />} />
        <Route path="/admin/buses/new" element={<NewBus />} />
        <Route path="/admin/buses/edit/:id" element={<EditBus />} />
        <Route path="/admin/cities" element={<Cities />} />
        <Route path="/admin/cities/new" element={<NewCity />} />
        <Route path="/admin/bookings" element={<Bookings />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/users" element={<Users />} />
      </Routes>
    </>
  );
}

export default App;
