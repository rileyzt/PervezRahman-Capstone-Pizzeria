// ORDER SERVICE — business logic for orders
// This is the "Service Layer" — keeps controllers thin
// Controller handles HTTP (req, res) → Service handles LOGIC

// calculate bill with discount and GST
const calculateBill = (items) => {
  // Step 1: Calculate subtotal (sum of all items)
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    subtotal = subtotal + (items[i].price * items[i].quantity);
  }

  // Step 2: Apply 10% discount
  const discountPercent = 10;
  const discountAmount = Math.round(subtotal * discountPercent / 100);

  // Step 3: Calculate amount after discount
  const afterDiscount = subtotal - discountAmount;

  // Step 4: Apply 5% GST on discounted amount
  const gstPercent = 5;
  const gstAmount = Math.round(afterDiscount * gstPercent / 100);

  // Step 5: Final total
  const totalAmount = afterDiscount + gstAmount;

  return {
    subtotal,
    discountPercent,
    discountAmount,
    afterDiscount,
    gstPercent,
    gstAmount,
    totalAmount
  };
};

// format order data for response (DTO — Data Transfer Object)
const formatOrderResponse = (order) => {
  return {
    _id: order._id,
    items: order.items,
    subtotal: order.subtotal,
    discountPercent: order.discountPercent,
    discountAmount: order.discountAmount,
    gstPercent: order.gstPercent,
    gstAmount: order.gstAmount,
    totalAmount: order.totalAmount,
    status: order.status,
    statusMessage: order.statusMessage,
    paymentStatus: order.paymentStatus,
    deliveryMode: order.deliveryMode,
    deliveryAddress: order.deliveryAddress,
    couponCode: order.couponCode,
    createdAt: order.createdAt,
    user: order.user
  };
};

module.exports = { calculateBill, formatOrderResponse };
