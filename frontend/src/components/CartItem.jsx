// CART ITEM - using Bootstrap flex and button classes

import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="card border-dark-custom p-3 mb-2">
      <div className="d-flex align-items-center gap-3">
        <div className="flex-grow-1">
          <h6 className="fw-semibold text-white mb-1">{item.name}</h6>
          <small className="text-secondary">₹{item.price} each</small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-dark btn-sm border-secondary" onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
          <span className="text-white fw-semibold" style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
          <button className="btn btn-dark btn-sm border-secondary" onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
        </div>

        <span className="text-brand fw-bold" style={{ minWidth: '60px', textAlign: 'right' }}>₹{item.price * item.quantity}</span>

        <button className="btn btn-sm text-secondary border-0" onClick={() => removeFromCart(item._id)}>✕</button>
      </div>
    </div>
  );
};

export default CartItem;
