// ADMIN DASHBOARD - with review sentiment analytics

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, getReviewStats } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, delivered: 0, revenue: 0 });
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => { fetchStats(); fetchReviews(); }, []);

  const fetchStats = async () => {
    try {
      const response = await getAllOrders();
      const orders = response.data;
      let revenue = 0, pending = 0, delivered = 0;
      for (let i = 0; i < orders.length; i++) {
        if (orders[i].status === 'delivered') { revenue += orders[i].totalAmount; delivered++; }
        if (orders[i].status === 'pending') { pending++; }
      }
      setStats({ total: orders.length, pending, delivered, revenue });
    } catch (error) { console.log('Error:', error); }
  };

  const fetchReviews = async () => {
    try {
      const response = await getReviewStats();
      setReviewData(response.data);
    } catch (error) { console.log('Reviews Error:', error); }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <h1 className="fw-bold text-white mb-4">Admin Dashboard</h1>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h3 className="text-brand fw-bold">{stats.total}</h3>
            <small className="text-secondary">Total Orders</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h3 className="fw-bold text-warning">{stats.pending}</h3>
            <small className="text-secondary">Pending</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h3 className="fw-bold text-success-custom">{stats.delivered}</h3>
            <small className="text-secondary">Delivered</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h3 className="text-brand fw-bold">₹{stats.revenue}</h3>
            <small className="text-secondary">Revenue</small>
          </div>
        </div>
      </div>

      {reviewData && (
        <div className="card border-dark-custom p-4 mb-4" style={{ borderLeft: '3px solid #7C3AED' }}>
          <h5 className="fw-semibold mb-3" style={{ color: '#7C3AED' }}>AI Sentiment Analytics</h5>
          <div className="row g-3">
            <div className="col-4 text-center">
              <h4 className="fw-bold text-success-custom">{reviewData.positive}</h4>
              <small className="text-secondary">Positive</small>
            </div>
            <div className="col-4 text-center">
              <h4 className="fw-bold text-warning">{reviewData.neutral}</h4>
              <small className="text-secondary">Neutral</small>
            </div>
            <div className="col-4 text-center">
              <h4 className="fw-bold text-brand">{reviewData.negative}</h4>
              <small className="text-secondary">Negative</small>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-white">Avg Rating: </span>
            <span style={{ color: '#FFD700', fontWeight: 700 }}>{'★'.repeat(Math.round(reviewData.avgRating))} {reviewData.avgRating}/5</span>
            <span className="text-secondary ms-2">({reviewData.totalReviews} reviews)</span>
          </div>

          {reviewData.reviews && reviewData.reviews.length > 0 && (
            <div className="mt-3 border-top border-dark-custom pt-3">
              <small className="text-secondary mb-2 d-block">Recent Reviews:</small>
              {reviewData.reviews.slice(0, 5).map((r) => (
                <div className="bg-card-hover rounded p-2 mb-2" key={r._id}>
                  <div className="d-flex justify-content-between">
                    <small className="text-white">{r.user?.name || 'Customer'}</small>
                    <small style={{ color: '#FFD700' }}>{'★'.repeat(r.rating)}</small>
                  </div>
                  <small className="text-secondary fst-italic">"{r.reviewText}"</small>
                  <small className={`d-block mt-1 ${r.sentiment === 'positive' ? 'text-success-custom' : r.sentiment === 'negative' ? 'text-brand' : 'text-warning'}`}>
                    Sentiment: {r.sentiment}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-4">
          <Link to="/admin/menu" className="text-decoration-none">
            <div className="card border-dark-custom p-4 menu-card">
              <h5 className="fw-semibold text-white mb-1">Manage Menu</h5>
              <small className="text-secondary">Add, edit, delete menu items</small>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/orders" className="text-decoration-none">
            <div className="card border-dark-custom p-4 menu-card">
              <h5 className="fw-semibold text-white mb-1">Manage Orders</h5>
              <small className="text-secondary">Accept, reject, update orders</small>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/admin/revenue" className="text-decoration-none">
            <div className="card border-dark-custom p-4 menu-card">
              <h5 className="fw-semibold text-white mb-1">Revenue</h5>
              <small className="text-secondary">View monthly revenue</small>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
