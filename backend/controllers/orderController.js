// ORDER CONTROLLER — uses service layer for business logic

const Order = require('../models/Order');
const { calculateBill, formatOrderResponse } = require('../services/orderService');
const { getStatusMessage } = require('../services/messageService');
const { sendOrderEmail } = require('../services/notificationService');

// A simple automated timer that updates the order status every 3 seconds
const startAutomatedProgression = (orderId) => {
  // Step 1: Wait 3 seconds, then update to "accepted"
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      if (order && order.status === 'pending') {
        order.status = 'accepted';
        order.statusMessage = 'Your order has been accepted by the kitchen!';
        await order.save();
        console.log(`Order ${orderId} automatically updated to: accepted`);

        // Step 2: Wait 3 more seconds, then update to "preparing"
        setTimeout(async () => {
          try {
            const order2 = await Order.findById(orderId);
            if (order2 && order2.status === 'accepted') {
              order2.status = 'preparing';
              order2.statusMessage = 'Our chef is preparing your delicacies';
              await order2.save();
              console.log(`Order ${orderId} automatically updated to: preparing`);

              // Step 3: Wait 3 more seconds, then update to "out_for_delivery"
              setTimeout(async () => {
                try {
                  const order3 = await Order.findById(orderId);
                  if (order3 && order3.status === 'preparing') {
                    order3.status = 'out_for_delivery';
                    order3.statusMessage = 'Your order is out for delivery!';
                    await order3.save();
                    console.log(`Order ${orderId} automatically updated to: out_for_delivery`);

                    // Step 4: Wait 3 more seconds, then update to "delivered"
                    setTimeout(async () => {
                      try {
                        const order4 = await Order.findById(orderId);
                        if (order4 && order4.status === 'out_for_delivery') {
                          order4.status = 'delivered';
                          order4.statusMessage = 'Order delivered! Enjoy your delicious pizza!';
                          await order4.save();
                          console.log(`Order ${orderId} automatically updated to: delivered`);
                        }
                      } catch (err) {
                        console.error('Error in delivered step:', err);
                      }
                    }, 3000);
                  }
                } catch (err) {
                  console.error('Error in out_for_delivery step:', err);
                }
              }, 3000);
            }
          } catch (err) {
            console.error('Error in preparing step:', err);
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Error in accepted step:', err);
    }
  }, 3000);
};

// POST /api/orders — customer places a new order
const placeOrder = async (req, res) => {
  try {
    const { items, deliveryMode, deliveryAddress } = req.body;

    // check if cart is empty
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // use service to calculate bill (subtotal, discount, GST, total)
    const bill = calculateBill(items);

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal: bill.subtotal,
      discountPercent: bill.discountPercent,
      discountAmount: bill.discountAmount,
      gstPercent: bill.gstPercent,
      gstAmount: bill.gstAmount,
      totalAmount: bill.totalAmount,
      deliveryMode: deliveryMode || 'delivery',
      deliveryAddress: deliveryAddress || req.user.address || '',
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Send order confirmation email (non-blocking)
    if (req.user && req.user.email) {
      sendOrderEmail(req.user.email, order);
    }

    // Start the automatic order tracking progression
    startAutomatedProgression(order._id);

    res.status(201).json(formatOrderResponse(order));
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/orders/my — customer sees their own orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders.map(formatOrderResponse));
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/orders/:id — get single order details
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(formatOrderResponse(order));
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// PUT /api/orders/:id/cancel — customer cancels order (only if pending)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order cannot be cancelled. It is already ' + order.status });
    }

    order.status = 'cancelled';
    order.statusMessage = getStatusMessage('cancelled');
    await order.save();

    res.json({ message: 'Order cancelled', order: formatOrderResponse(order) });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/orders — admin sees ALL orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// PUT /api/orders/:id/status — admin updates order status + auto message
const updateOrderStatus = async (req, res) => {
  try {
    const { status, statusMessage } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) {
      order.status = status;
      // auto-generate message using message service if none provided
      order.statusMessage = statusMessage || getStatusMessage(status);
    }

    await order.save();
    res.json({ message: 'Order updated', order: formatOrderResponse(order) });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };
