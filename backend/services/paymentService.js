// PAYMENT SERVICE — coupon validation logic

// check if coupon code is valid
const validateCoupon = (couponCode) => {
  // the valid coupon is stored in .env as COUPON_CODE=WIPRO
  const validCoupon = process.env.COUPON_CODE || 'WIPRO';

  if (couponCode.toUpperCase() === validCoupon.toUpperCase()) {
    return { valid: true, message: 'Coupon applied successfully' };
  } else {
    return { valid: false, message: 'Invalid coupon code' };
  }
};

// format payment response (DTO)
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
