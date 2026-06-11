// NAVBAR — using Bootstrap navbar classes

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark fixed-top px-4">
      <Link to="/" className="brand-logo">PIZZERIA</Link>

      <div className="d-flex align-items-center gap-3">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/menu" className="nav-link">Menu</Link>

        {isAuthenticated ? (
          <>
            <Link to="/cart" className="nav-link">
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
            <Link to="/orders" className="nav-link">Orders</Link>
            <Link to="/profile" className="nav-link">Profile</Link>

            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link nav-link-admin">Admin</Link>
            )}

            <span className="text-white" style={{ fontSize: '0.9rem' }}>{user.name}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link text-white">Sign In</Link>
            <Link to="/register" className="btn btn-danger btn-sm fw-semibold px-3">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
