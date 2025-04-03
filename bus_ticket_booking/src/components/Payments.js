import React, { useEffect, useState } from 'react';
import apiClient from '../api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/api/admin/payments')
      .then(response => {
        setPayments(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load payments:', error.response ? error.response.data : error);
        setError('Failed to load payments.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-dark"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}
    >
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white">
            <h2 className="mb-0">
              <i className="bi bi-cash-stack me-2"></i>Payments
            </h2>
          </div>
          <div className="card-body">
            {payments.length === 0 ? (
              <div className="alert alert-info text-center">
                <i className="bi bi-info-circle me-2"></i>No payments found.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Payment ID</th>
                      <th scope="col">Transaction ID</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Status</th>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
