// ADMIN - MANAGE ORDERS - CARDS

import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import OrderCard from '../../components/OrderCard';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try { const res = await getAllOrders(); setOrders(res.data); } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId, status, message) => {
    try { await updateOrderStatus(orderId, { status, statusMessage: message }); fetchOrders(); } catch (err) { alert('Failed to update'); }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="container py-5" style={{ maxWidth: '750px' }}>
      <h1 className="fw-bold text-white mb-4">Manage Orders</h1>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {['all', 'pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].map((f) => (
          <button key={f} className={filter === f ? 'btn btn-danger btn-sm tab-active' : 'btn btn-dark btn-sm'} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-secondary py-5">Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-secondary py-5">No orders found</p>
      ) : (
        filteredOrders.map((order) => (
          <OrderCard key={order._id} order={order} isAdmin={true} onStatusUpdate={handleStatusUpdate} />
        ))
      )}
    </div>
  );
};

export default ManageOrders;
