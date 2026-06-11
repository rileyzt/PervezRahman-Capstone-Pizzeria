// PAYMENT ROUTES - Dummy Payment Gateway
// PDF Reference: "As a user, I should be able to see the bill amount for the order along with payment options"
//
// THIS FILE DOES:
// 1. Provides a dummy payment processing endpoint
// 2. Validates coupon code - if "WIPRO" is entered, payment is marked as completed
// 3. Returns payment status to the frontend
//
// DESIGN DECISION - Dummy payment with coupon code:
//   - Real payment gateways (Razorpay, Stripe) require business verification
//   - For this capstone, we simulate payment using a coupon code
//   - Coupon code "WIPRO" = payment successful, order gets booked
//   - Any other code = payment failed

// HOW IT WORKS:
//   1. User enters coupon code "WIPRO" at checkout
//   2. Frontend sends POST /api/payment/process with { orderId, couponCode }
//   3. Backend checks: if couponCode === "WIPRO" → mark payment as 'completed'
//   4. Order status stays 'pending' (waiting for admin to accept)

const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPaymentStatus
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/payment/process - Process dummy payment with coupon code
router.post('/process', protect, processPayment);

// GET /api/payment/status/:orderId - Check payment status of an order
router.get('/status/:orderId', protect, getPaymentStatus);

module.exports = router;
