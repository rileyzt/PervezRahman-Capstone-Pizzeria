// ORDER STATUS PAGE 
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder, submitReview } from '../services/api';
import toast from 'react-hot-toast';

const steps = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];

const OrderStatus = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prevStatus, setPrevStatus] = useState('');

  // review state
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewResult, setReviewResult] = useState('');

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await getOrder(id);
      const newOrder = response.data;
      if (prevStatus && newOrder.status !== prevStatus) {
        toast.success(newOrder.statusMessage || 'Order status updated!');
      }
      setPrevStatus(newOrder.status);
      setOrder(newOrder);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewText.trim()) { toast.error('Please write a review'); return; }
    try {
      const response = await submitReview({ orderId: id, reviewText, rating });
      setReviewSubmitted(true);
      setReviewResult(response.data.message);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) return <p className="text-center text-secondary py-5">Loading...</p>;
  if (!order) return <p className="text-center text-secondary py-5">Order not found</p>;

  const currentStep = steps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

  return (
    <div className="container py-5" style={{ maxWidth: '550px' }}>
      <h1 className="fw-bold text-white mb-4">Order Status</h1>

      <div className="card border-dark-custom p-4">
        <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>Order #{order._id.slice(-6).toUpperCase()}</p>

        {isCancelled ? (
          <div className="text-center py-4">
            <h4 className="text-brand fw-bold">{order.status === 'cancelled' ? 'Order Cancelled' : 'Order Rejected'}</h4>
          </div>
        ) : (
          <div className="mb-4">
            {steps.map((step, index) => (
              <div className="d-flex align-items-center gap-3 mb-3" key={step}>
                <div className={index <= currentStep ? 'status-dot status-dot-active' : 'status-dot status-dot-inactive'}></div>
                <span className={index <= currentStep ? 'text-white fw-medium' : 'text-secondary'} style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {order.statusMessage && (
          <div className="bg-card-hover rounded p-3 mb-4">
            <small className="text-secondary">Message from restaurant:</small>
            <p className="text-white mb-0 fst-italic" style={{ fontSize: '0.9rem' }}>"{order.statusMessage}"</p>
          </div>
        )}

        <div className="border-top border-dark-custom pt-3">
          <h6 className="fw-semibold text-white mb-3">Bill Details</h6>
          {order.items.map((item, i) => (
            <div className="d-flex justify-content-between mb-1" key={i}>
              <span className="text-secondary" style={{ fontSize: '0.9rem' }}>{item.name} x{item.quantity}</span>
              <span className="text-white" style={{ fontSize: '0.9rem' }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <hr style={{ borderColor: '#2A2A2A' }} />
          <div className="d-flex justify-content-between mb-1">
            <span className="text-secondary">Subtotal</span>
            <span className="text-white">₹{order.subtotal || order.totalAmount}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-success-custom">Discount ({order.discountPercent}%)</span>
              <span className="text-success-custom">-₹{order.discountAmount}</span>
            </div>
          )}
          {order.gstAmount > 0 && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary">GST ({order.gstPercent}%)</span>
              <span className="text-white">+₹{order.gstAmount}</span>
            </div>
          )}
          <hr style={{ borderColor: '#2A2A2A' }} />
          <div className="d-flex justify-content-between mb-3">
            <span className="fw-semibold text-white">Total</span>
            <span className="text-brand fw-bold" style={{ fontSize: '1.1rem' }}>₹{order.totalAmount}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-secondary">Payment</span>
            <span className={order.paymentStatus === 'completed' ? 'text-success-custom' : 'text-warning'}>{order.paymentStatus === 'completed' ? 'PAID' : 'PENDING'}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="text-secondary">Delivery</span>
            <span className="text-white text-capitalize">{order.deliveryMode}</span>
          </div>
        </div>
      </div>

      {order.status === 'delivered' && (
        <div className="card border-dark-custom p-4 mt-3" style={{ borderLeft: '3px solid #7C3AED' }}>
          <h6 className="fw-semibold mb-3" style={{ color: '#7C3AED' }}>Rate Your Experience</h6>

          {reviewSubmitted ? (
            <div className="text-center py-3">
              <p className="text-success-custom fw-semibold mb-1">Thank you for your review!</p>
              <small className="text-secondary">{reviewResult}</small>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label text-secondary" style={{ fontSize: '0.85rem' }}>Rating</label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="btn btn-sm" style={{ color: star <= rating ? '#FFD700' : '#333', fontSize: '1.5rem', padding: '0 4px', border: 'none', background: 'none' }} onClick={() => setRating(star)}>
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea className="form-control mb-3" placeholder="How was your experience? Tell us..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} />

              <button className="btn w-100 fw-semibold" style={{ background: '#7C3AED', color: '#fff' }} onClick={handleReviewSubmit}>
                Submit Review
              </button>
              <small className="text-secondary d-block text-center mt-2">AI will analyze your sentiment automatically</small>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderStatus;
