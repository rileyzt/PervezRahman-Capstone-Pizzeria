// ADMIN ROUTES - Revenue, Billing, Dashboard Data
// PDF Reference: "As an admin, I should be able to see the monthly revenue of the shop"
// PDF Reference: "As an admin, I should be able to generate the bill of particular user"
// THIS FILE DOES:
// 1. Monthly revenue endpoint - aggregates total sales per month
// 2. Generate bill for a specific user/order
// 3. Dashboard stats - total orders, total users, popular items
// ROUTEs
//   GET /api/admin/revenue - Monthly revenue data
//   GET /api/admin/bill/:orderId - Generate bill for specific order
//   GET /api/admin/stats - Dashboard statistics


const express = require('express');
const router = express.Router();
const {
  getMonthlyRevenue,
  generateBill,
  getDashboardStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All admin routes require login + admin role
router.use(protect, adminOnly);

// GET /api/admin/revenue - Get monthly revenue data
// PDF: "As an admin, I should be able to see the monthly revenue of the shop"
// Uses MongoDB aggregation to group orders by month and sum totalAmount 
router.get('/revenue', getMonthlyRevenue);

// GET /api/admin/bill/:orderId - Generate bill for a specific order
// PDF: "As an admin, I should be able to generate the bill of particular user"
// Returns detailed bill with item breakdown, taxes, total in real world format
router.get('/bill/:orderId', generateBill);

// GET /api/admin/stats - Dashboard overview statistics
// Returns: total orders, total customers, total revenue, popular items in real time format
router.get('/stats', getDashboardStats);

module.exports = router;
