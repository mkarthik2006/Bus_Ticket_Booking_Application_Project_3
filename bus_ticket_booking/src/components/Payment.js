import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const bookingIdFromQuery = searchParams.get('bookingId') || '';

  // Payment details state; pre-populated from booking info.
  const [paymentDetails, setPaymentDetails] = useState({
    bookingId: bookingIdFromQuery,
    amount: 0,
    paymentProvider: 'stripe'
  });

  // State for fetched booking info (for display)
  const [bookingInfo, setBookingInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch booking details when bookingId is available.
  useEffect(() => {
    if (bookingIdFromQuery) {
      apiClient.get(`/api/bookings/${bookingIdFromQuery}`)
        .then(response => {
          const booking = response.data;
          setBookingInfo(booking);
          // Pre-populate payment details from booking info.
          setPaymentDetails(prev => ({
            ...prev,
            bookingId: booking.id,
            amount: booking.totalAmount
          }));
        })
        .catch(error => {
          console.error("Error fetching booking details:", error);
          setMessage("Failed to load booking details.");
        });
    }
  }, [bookingIdFromQuery]);

  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    apiClient.post('/api/payments', paymentDetails)
      .then(() => {
        setMessage('Payment processed successfully!');
        setLoading(false);
      })
      .catch(() => {
        setMessage('Payment failed. Please try again.');
        setLoading(false);
      });
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-dark min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}
    >
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white">
            <h2>
              <i className="bi bi-credit-card me-2"></i>Make a Payment
            </h2>
          </div>
          <div className="card-body">
            {bookingInfo && (
              <div className="mb-4">
                <h5><i className="bi bi-info-circle me-2"></i>Booking Details:</h5>
                <p><strong>Booking ID:</strong> {bookingInfo.id}</p>
                <p><strong>Boarding Point:</strong> {bookingInfo.boardingPoint}</p>
                <p><strong>Dropping Point:</strong> {bookingInfo.droppingPoint}</p>
                <p><strong>Total Amount:</strong> {bookingInfo.totalAmount}</p>
                {bookingInfo.passengers && bookingInfo.passengers.length > 0 && (
                  <div>
                    <h6><i className="bi bi-people me-2"></i>Passengers:</h6>
                    <ul className="list-group">
                      {bookingInfo.passengers.map((p, index) => (
                        <li key={index} className="list-group-item">
                          {p.name} ({p.gender})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="bookingId" className="form-label">
                  <i className="bi bi-hash me-1"></i>Booking ID
                </label>
                <input
                  type="number"
                  id="bookingId"
                  name="bookingId"
                  value={paymentDetails.bookingId}
                  onChange={handleChange}
                  className="form-control"
                  readOnly
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="amount" className="form-label">
                  <i className="bi bi-currency-dollar me-1"></i>Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={paymentDetails.amount}
                  onChange={handleChange}
                  className="form-control"
                  readOnly
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="paymentProvider" className="form-label">
                  <i className="bi bi-shop-window me-1"></i>Payment Provider
                </label>
                <select
                  id="paymentProvider"
                  name="paymentProvider"
                  value={paymentDetails.paymentProvider}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                </select>
              </div>
              <div className="text-center mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <i className="bi bi-check-circle me-1"></i>
                  {loading ? 'Processing...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
