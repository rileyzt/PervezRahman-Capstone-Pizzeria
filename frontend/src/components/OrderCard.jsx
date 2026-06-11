// ORDER CARD - using Bootstrap card, badge, and button classes

const OrderCard = ({ order, onCancel, isAdmin, onStatusUpdate }) => {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // pick badge class for status
  const getBadgeClass = (status) => {
    if (status === 'delivered') return 'badge-delivered';
    if (status === 'accepted' || status === 'preparing') return 'badge-accepted';
    if (status === 'rejected' || status === 'cancelled') return 'badge-rejected';
    return 'badge-pending';
  };

  return (
    <div className="card border-dark-custom p-3 mb-2">
   
      <div className="d-flex justify-content-between mb-2">
        <span className="fw-semibold text-white" style={{ fontSize: '0.9rem' }}>Order #{order._id.slice(-6).toUpperCase()}</span>
        <small className="text-secondary">{date}</small>
      </div>

 
      <p className="text-secondary mb-2" style={{ fontSize: '0.85rem' }}>
        {order.items.map((item, i) => (
          <span key={i}>{item.name} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
        ))}
      </p>

      <div className="d-flex align-items-center gap-3">
        <span className="text-brand fw-bold" style={{ fontSize: '1.1rem' }}>₹{order.totalAmount}</span>
        <span className={`badge rounded-pill fw-semibold ${getBadgeClass(order.status)}`} style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>

        {onCancel && order.status === 'pending' && (
          <button className="btn btn-outline-secondary btn-sm ms-auto" onClick={() => onCancel(order._id)}>Cancel</button>
        )}
      </div>

    
      {order.statusMessage && (
        <p className="text-secondary fst-italic mt-2 mb-0" style={{ fontSize: '0.85rem' }}>"{order.statusMessage}"</p>
      )}

      {isAdmin && order.status === 'pending' && (
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-sm fw-semibold" style={{ background: '#46D369', color: '#000' }} onClick={() => onStatusUpdate(order._id, 'accepted', 'Order accepted! Preparing your food.')}>Accept</button>
          <button className="btn btn-danger btn-sm fw-semibold" onClick={() => onStatusUpdate(order._id, 'rejected', 'Sorry, we cannot process this order.')}>Reject</button>
        </div>
      )}
      {isAdmin && order.status === 'accepted' && (
        <div className="mt-3">
          <button className="btn btn-sm fw-semibold" style={{ background: '#46D369', color: '#000' }} onClick={() => onStatusUpdate(order._id, 'preparing', 'Your food is being prepared!')}>Preparing</button>
        </div>
      )}
      {isAdmin && order.status === 'preparing' && (
        <div className="mt-3">
          <button className="btn btn-sm fw-semibold" style={{ background: '#46D369', color: '#000' }} onClick={() => onStatusUpdate(order._id, 'out_for_delivery', 'Your order is on the way!')}>Out for Delivery</button>
        </div>
      )}
      {isAdmin && order.status === 'out_for_delivery' && (
        <div className="mt-3">
          <button className="btn btn-sm fw-semibold" style={{ background: '#46D369', color: '#000' }} onClick={() => onStatusUpdate(order._id, 'delivered', 'Order delivered! Enjoy your meal.')}>Mark Delivered</button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
