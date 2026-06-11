// PAYMENT SERVICE - coupon validation logic

// check if coupon code is valid
const validateCoupon = (couponCode) => {
  // the valid coupon is stored in .env and also hardcoded here
  const validCoupon = process.env.COUPON_CODE || 'WIPRO';

  if (couponCode.toUpperCase() === validCoupon.toUpperCase()) {
    return { valid: true, message: 'Coupon applied successfully' };
  } else {
    return { valid: false, message: 'Invalid coupon code' };
  }
};

// format payment response 
const formatPaymentResponse = (order) => {
  return {
    orderId: order._id,
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    couponCode: order.couponCode
  };
};

module.exports = { validateCoupon, formatPaymentResponse };
