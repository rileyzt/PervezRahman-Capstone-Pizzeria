// MESSAGE SERVICE — generates status messages for order updates
// PDF: "I should be able to receive message or pop up on the order status"

// get a message based on order status
const getStatusMessage = (status) => {
  if (status === 'accepted') {
    return 'Your order has been accepted! We are preparing it now.';
  }
  if (status === 'preparing') {
    return 'Your food is being prepared by our chef!';
  }
  if (status === 'out_for_delivery') {
    return 'Your order is on the way! Arriving soon.';
  }
  if (status === 'delivered') {
    return 'Order delivered! Enjoy your meal. Thank you!';
  }
  if (status === 'rejected') {
    return 'Sorry, we could not process your order at this time.';
  }
  if (status === 'cancelled') {
    return 'Your order has been cancelled.';
  }
  return 'Order is pending. We will update you soon.';
};

// format notification for frontend
const formatNotification = (order, status) => {
  return {
    orderId: order._id,
    status: status,
    message: getStatusMessage(status),
    timestamp: new Date()
  };
};

module.exports = { getStatusMessage, formatNotification };
