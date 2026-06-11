// CART PAGE 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container py-5" style={{ maxWidth: '700px' }}>
        <h1 className="fw-bold text-white mb-4">Your Cart</h1>
        <div className="text-center py-5">
          <p className="text-secondary mb-4" style={{ fontSize: '1.1rem' }}>Your cart is empty</p>
          <button className="btn btn-danger px-5 py-2 fw-semibold" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '700px' }}>
      <h1 className="fw-bold text-white mb-4">Your Cart</h1>

     
      <div className="mb-4">
        {cartItems.map((item) => (
          <CartItem key={item._id} item={item} />
        ))}
      </div>
      <div className="card border-dark-custom p-4">
        <div className="d-flex justify-content-between mb-2">
          <span className="text-secondary">Items</span>
          <span className="text-white fw-semibold">{cartItems.length}</span>
        </div>
        <div className="d-flex justify-content-between mb-3">
          <span className="text-secondary">Total</span>
          <span className="text-brand fw-bold" style={{ fontSize: '1.3rem' }}>₹{getTotal()}</span>
        </div>
        <button className="btn btn-danger w-100 py-3 fw-bold mt-2" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
        <button className="btn btn-outline-secondary w-100 mt-2" onClick={clearCart}>
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default Cart;
