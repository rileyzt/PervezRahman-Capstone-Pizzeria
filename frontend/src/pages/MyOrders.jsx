// MY ORDERS PAGE 

import { useState, useEffect } from 'react';
import { getMyOrders, cancelOrder as cancelOrderAPI } from '../services/api';
import OrderCard from '../components/OrderCard';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const response = await getMyOrders();
      setOrders(response.data);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrderAPI(orderId);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <p className="text-center text-secondary py-5">Loading orders...</p>;

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <h1 className="fw-bold text-white mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-secondary py-5">No orders yet</p>
      ) : (
        orders.map((order) => (
          <OrderCard key={order._id} order={order} onCancel={handleCancel} />
        ))
      )}
    </div>
  );
};

export default MyOrders;
