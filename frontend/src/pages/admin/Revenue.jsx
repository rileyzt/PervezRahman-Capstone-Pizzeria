// ADMIN — REVENUE — using Bootstrap grid, card, and table classes

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMonthlyRevenue } from '../../services/api';

const Revenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRevenue(); }, []);

  const fetchRevenue = async () => {
    try { const res = await getMonthlyRevenue(); setData(res.data); } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  if (loading) return <p className="text-center text-secondary py-5">Loading...</p>;
  if (!data) return <p className="text-center text-secondary py-5">No data available</p>;

  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <h1 className="fw-bold text-white mb-4">Revenue Report</h1>

      {/* Stats */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h4 className="text-brand fw-bold">₹{data.totalRevenue}</h4>
            <small className="text-secondary">Total Revenue</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h4 className="fw-bold text-success-custom">₹{data.totalDiscount}</h4>
            <small className="text-secondary">Discounts Given</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h4 className="fw-bold text-warning">₹{data.totalGST}</h4>
            <small className="text-secondary">GST Collected</small>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-dark-custom p-3 text-center">
            <h4 className="text-brand fw-bold">{data.totalOrders}</h4>
            <small className="text-secondary">Delivered Orders</small>
          </div>
        </div>
      </div>

      {/* Orders list */}
      <h5 className="fw-semibold text-white mb-3">Delivered Orders</h5>
      {data.orders && data.orders.length > 0 ? (
        data.orders.map((order) => (
          <div className="card border-dark-custom p-3 mb-2" key={order._id}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="fw-semibold text-white me-3" style={{ fontSize: '0.9rem' }}>#{order._id.slice(-6).toUpperCase()}</span>
                <small className="text-secondary">{new Date(order.createdAt).toLocaleDateString('en-IN')}</small>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="text-brand fw-bold">₹{order.totalAmount}</span>
                <Link to={'/admin/bill/' + order._id} className="btn btn-dark btn-sm border-secondary">View Bill</Link>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-secondary py-3">No delivered orders yet</p>
      )}
    </div>
  );
};

export default Revenue;
