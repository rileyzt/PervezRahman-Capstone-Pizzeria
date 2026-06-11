// PAYMENT CONTROLLER - uses payment service for coupon validation

const Order = require('../models/Order');
const { validateCoupon, formatPaymentResponse } = require('../services/paymentService');
// POST /api/payment/process - validate coupon and mark payment
const processPayment = async (req, res) => {
  try {
    const { orderId, couponCode } = req.body;

    if (!orderId || !couponCode) {
      return res.status(400).json({ message: 'Please provide order ID and coupon code' });
    }
    // find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // already paid?
    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }
    // use payment service to validate coupon
    const result = validateCoupon(couponCode);
    if (result.valid) {
      // coupon is valid - mark payment as completed
      order.paymentStatus = 'completed';
      order.couponCode = couponCode.toUpperCase();
      order.paymentMethod = 'coupon';
      await order.save();

      res.json({
        message: 'Payment successful!',
        payment: formatPaymentResponse(order)
      });
    } else {
      // invalid coupon
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/payment/status/:orderId
const getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(formatPaymentResponse(order));
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

module.exports = { processPayment, getPaymentStatus };
