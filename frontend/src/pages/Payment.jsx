// PAYMENT PAGE — using Bootstrap card and form classes

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { processPayment } from '../services/api';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setError('');
    if (!coupon.trim()) { setError('Please enter a coupon code'); return; }

    try {
      setLoading(true);
      await processPayment({ orderId, couponCode: coupon });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="card border-dark-custom p-5 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="fw-bold mb-2" style={{ color: '#46D369' }}>Payment Successful</h2>
          <p className="text-secondary mb-4">Your order has been confirmed!</p>
          <button className="btn btn-danger w-100 py-3 fw-semibold" onClick={() => navigate('/order/' + orderId)}>Track Order</button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card border-dark-custom p-5 text-center" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="fw-bold text-white mb-1">Payment</h2>
        <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>Enter coupon code to complete payment</p>

        {error && <div className="alert py-2 mb-3" style={{ background: 'rgba(229,9,20,0.1)', border: 'none', color: '#E50914', fontSize: '0.9rem' }}>{error}</div>}

        <input
          type="text"
          className="form-control py-3 text-center mb-3"
          placeholder="Enter coupon code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          style={{ letterSpacing: '2px' }}
        />

        <button className="btn btn-danger w-100 py-3 fw-bold" onClick={handlePayment} disabled={loading}>
          {loading ? 'Processing...' : 'Pay Now'}
        </button>

        <p className="text-secondary mt-3 mb-0" style={{ fontSize: '0.8rem', color: '#444' }}>Hint: Use coupon code WIPRO</p>
      </div>
    </div>
  );
};

export default Payment;
