// NAVBAR - Responsive with hamburger menu for logged-in users on mobile //RESPONSIVENESS

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getCartCount();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar navbar-dark fixed-top px-4">
      <Link to="/" className="brand-logo">PIZZERIA</Link>

      {isAuthenticated ? (
        <>
    {/*Desktop nav - hidden on mobile*/}
          <div className="nav-desktop d-none d-md-flex align-items-center gap-3">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/menu" className="nav-link">Menu</Link>
            <Link to="/cart" className="nav-link">
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
            <Link to="/orders" className="nav-link">Orders</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link nav-link-admin">Admin</Link>
            )}
            <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Logout</button>
          </div>

        
          <button
            className="hamburger-btn d-md-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {menuOpen && <div className="mobile-menu-overlay" onClick={closeMenu}></div>}

          <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
            <Link to="/" className="mobile-menu-link" onClick={closeMenu}>Home</Link>
            <Link to="/menu" className="mobile-menu-link" onClick={closeMenu}>Menu</Link>
            <Link to="/cart" className="mobile-menu-link" onClick={closeMenu}>
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
            <Link to="/orders" className="mobile-menu-link" onClick={closeMenu}>Orders</Link>
            <Link to="/profile" className="mobile-menu-link" onClick={closeMenu}>Profile</Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="mobile-menu-link mobile-menu-link-admin" onClick={closeMenu}>Admin</Link>
            )}
            <div className="mobile-menu-divider"></div>
            <button className="mobile-menu-logout" onClick={handleLogout}>Logout</button>
          </div>
        </>
      ) : (
   
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/menu" className="nav-link">Menu</Link>
          <Link to="/login" className="nav-link text-white">Sign In</Link>
          <Link to="/register" className="btn btn-danger btn-sm fw-semibold px-3">Get Started</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
