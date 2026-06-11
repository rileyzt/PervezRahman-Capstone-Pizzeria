// CHECKOUT PAGE - with smart recommendations and bill breakdown

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder, getRecommendations } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart, addToCart } = useCart();
  const { user } = useAuth();

  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [address, setAddress] = useState(user?.address || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // bill breakdown
  const subtotal = getTotal();
  const discountPercent = 10;
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const gstPercent = 5;
  const gstAmount = Math.round(afterDiscount * gstPercent / 100);
  const totalAmount = afterDiscount + gstAmount;

  // fetch smart recommendations based on cart categories
  useEffect(() => {
    fetchRecommendations();
  }, [cartItems]);

  const fetchRecommendations = async () => {
    try {
      // get unique categories from cart items
      const cats = [];
      for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].category && !cats.includes(cartItems[i].category)) {
          cats.push(cartItems[i].category);
        }
      }
      if (cats.length === 0) return;

      const response = await getRecommendations(cats.join(','));
      setRecommendations(response.data.items || []);
    } catch (err) {
      console.log('Recommendation error:', err);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (cartItems.length === 0) { setError('Your cart is empty'); return; }
    if (deliveryMode === 'delivery' && !address.trim()) { setError('Please enter delivery address'); return; }

    try {
      setLoading(true);
      const orderData = {
        items: cartItems.map((item) => ({ menuItem: item._id, name: item.name, quantity: item.quantity, price: item.price })),
        deliveryMode,
        deliveryAddress: deliveryMode === 'delivery' ? address : 'Store Pickup',
      };
      const response = await placeOrder(orderData);
      clearCart();
      navigate('/payment/' + response.data._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-5" style={{ maxWidth: '550px' }}>
        <h1 className="fw-bold text-white mb-4">Checkout</h1>
        <p className="text-secondary text-center py-5">Your cart is empty. Add items first.</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '550px' }}>
      <h1 className="fw-bold text-white mb-4">Checkout</h1>

      {error && <div className="alert py-2 mb-3" style={{ background: 'rgba(229,9,20,0.1)', border: 'none', color: '#E50914', fontSize: '0.9rem' }}>{error}</div>}

      {recommendations.length > 0 && (
        <div className="card border-dark-custom p-4 mb-3" style={{ borderColor: '#7C3AED !important', borderLeft: '3px solid #7C3AED' }}>
          <h6 className="fw-semibold mb-3" style={{ color: '#7C3AED' }}>You might also like</h6>
          {recommendations.map((item) => (
            <div className="d-flex justify-content-between align-items-center mb-2" key={item._id}>
              <div>
                <span className="text-white" style={{ fontSize: '0.9rem' }}>{item.name}</span>
                <span className="text-secondary ms-2" style={{ fontSize: '0.8rem' }}>₹{item.price}</span>
              </div>
              <button className="btn btn-sm fw-semibold" style={{ background: '#7C3AED', color: '#fff', fontSize: '0.8rem' }} onClick={() => addToCart(item)}>
                + Add
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card border-dark-custom p-4 mb-3">
        <h5 className="fw-semibold text-white mb-3">Bill Summary</h5>
        {cartItems.map((item) => (
          <div className="d-flex justify-content-between mb-1" key={item._id}>
            <span className="text-secondary" style={{ fontSize: '0.9rem' }}>{item.name} x{item.quantity}</span>
            <span className="text-white" style={{ fontSize: '0.9rem' }}>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <hr style={{ borderColor: '#2A2A2A' }} />
        <div className="d-flex justify-content-between mb-1">
          <span className="text-secondary">Subtotal</span>
          <span className="text-white">₹{subtotal}</span>
        </div>
        <div className="d-flex justify-content-between mb-1">
          <span className="text-success-custom">Discount ({discountPercent}%)</span>
          <span className="text-success-custom">-₹{discountAmount}</span>
        </div>
        <div className="d-flex justify-content-between mb-1">
          <span className="text-secondary">GST ({gstPercent}%)</span>
          <span className="text-white">+₹{gstAmount}</span>
        </div>
        <hr style={{ borderColor: '#2A2A2A' }} />
        <div className="d-flex justify-content-between">
          <span className="fw-semibold text-white" style={{ fontSize: '1.1rem' }}>Total</span>
          <span className="text-brand fw-bold" style={{ fontSize: '1.3rem' }}>₹{totalAmount}</span>
        </div>
      </div>

      <div className="card border-dark-custom p-4 mb-3">
        <h5 className="fw-semibold text-white mb-3">Delivery Mode</h5>
        <div className="d-flex gap-2">
          <button className={deliveryMode === 'delivery' ? 'btn btn-danger flex-fill' : 'btn btn-dark flex-fill border-secondary'} onClick={() => setDeliveryMode('delivery')}>Home Delivery</button>
          <button className={deliveryMode === 'pickup' ? 'btn btn-danger flex-fill' : 'btn btn-dark flex-fill border-secondary'} onClick={() => setDeliveryMode('pickup')}>Store Pickup</button>
        </div>
        {deliveryMode === 'delivery' && (
          <div className="mt-3">
            <label className="form-label text-secondary" style={{ fontSize: '0.85rem' }}>Delivery Address</label>
            <textarea className="form-control" placeholder="Enter your full address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
          </div>
        )}
      </div>

      <button className="btn btn-danger w-100 py-3 fw-bold" style={{ fontSize: '1.1rem' }} onClick={handlePlaceOrder} disabled={loading}>
        {loading ? 'Placing Order...' : `Place Order  ₹${totalAmount}`}
      </button>
    </div>
  );
};

export default Checkout;
