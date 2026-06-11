// =====================================================
// ADMIN ROUTE — Only allows admin users
// =====================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Logged in but not admin → go to home
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Admin → show the page
  return children;
};

export default AdminRoute;
