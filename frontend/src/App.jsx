// APP.JSX — Main app with all routes

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import SupportChat from './components/SupportChat';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderStatus from './pages/OrderStatus';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageMenu from './pages/admin/ManageMenu';
import ManageOrders from './pages/admin/ManageOrders';
import GenerateBill from './pages/admin/GenerateBill';
import Revenue from './pages/admin/Revenue';

// Route guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Toaster position="top-center" />

          <main style={{ minHeight: 'calc(100vh - 140px)', paddingTop: '64px' }}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu/:category" element={<Menu />} />

              {/* Customer (need login) */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/payment/:orderId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/order/:id" element={<ProtectedRoute><OrderStatus /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Admin (need login + admin role) */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/menu" element={<AdminRoute><ManageMenu /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
              <Route path="/admin/bill/:orderId" element={<AdminRoute><GenerateBill /></AdminRoute>} />
              <Route path="/admin/revenue" element={<AdminRoute><Revenue /></AdminRoute>} />
            </Routes>
          </main>

          <SupportChat />
          <Footer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
