// ORDER ROUTES - Place, Cancel, View, Manage Orders
// PDF Reference: "As an user, I should be able to place / cancel the order"
// PDF Reference: "As an admin, I can accept or reject the order from the user/users"
// PDF Reference: "Once the order is placed I should be able to receive message or pop up on the order status"
//
// THIS FILE DOES:
// 1. Customer routes - place order, cancel order, view own orders, get order status
// 2. Admin routes - view all orders, update order status, send status message
//
// ALL routes are protected (require login)
// Admin routes additionally require admin role
//
// ROUTE DESIGN:
//   POST   /api/orders - Place a new order (customer)
//   GET    /api/orders/my - Get my orders (customer)
//   GET    /api/orders/:id - Get single order details
//   PUT    /api/orders/:id/cancel - Cancel an order (customer)
//   GET    /api/orders - Get all orders (admin)
//   PUT    /api/orders/:id/status - Update order status + send message (admin)

const express = require('express');
const router = express.Router();
const {placeOrder,getMyOrders,getOrderById,cancelOrder,getAllOrders,updateOrderStatus} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// CUSTOMER ROUTES (requires login)

// POST /api/orders - Place a new order
// PDF: "As an user, I should be able to place the order"
router.post('/', protect, placeOrder);

// GET /api/orders/my - View my order history
router.get('/my', protect, getMyOrders);

// GET /api/orders/:id - View specific order details
router.get('/:id', protect, getOrderById);

// PUT /api/orders/:id/cancel - Cancel a pending order
// PDF: "As an user, I should be able to cancel the order"
router.put('/:id/cancel', protect, cancelOrder);

// ADMIN ROUTES (requires login + admin role)

// GET /api/orders - View all orders from all users
// PDF: "As an admin, I can accept or reject the order from the user/users"
router.get('/', protect, adminOnly, getAllOrders);

// PUT /api/orders/:id/status - Accept/reject order + send status message
// PDF: "As an admin, I should be able to send the message or pop up to users on order status"
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
