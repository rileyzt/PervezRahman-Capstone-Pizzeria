// =====================================================
// PROTECTED ROUTE — Blocks pages if user is not logged in
// =====================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Still checking if user is logged in — show loading
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Not logged in — send to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Logged in — show the page
  return children;
};

export default ProtectedRoute;
