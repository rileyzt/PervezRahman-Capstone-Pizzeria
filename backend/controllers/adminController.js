// ADMIN CONTROLLER — revenue, billing, stats

const Order = require('../models/Order');

// GET /api/admin/revenue — monthly revenue
const getMonthlyRevenue = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'delivered', paymentStatus: 'completed' });

    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalGST = 0;

    for (let i = 0; i < orders.length; i++) {
      totalRevenue = totalRevenue + orders[i].totalAmount;
      totalDiscount = totalDiscount + (orders[i].discountAmount || 0);
      totalGST = totalGST + (orders[i].gstAmount || 0);
    }

    res.json({
      totalRevenue,
      totalDiscount,
      totalGST,
      totalOrders: orders.length,
      orders: orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/admin/bill/:orderId — generate bill for an order
const generateBill = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // formatted bill (DTO)
    const bill = {
      billNumber: 'BILL-' + order._id.toString().slice(-6).toUpperCase(),
      orderId: order._id,
      date: order.createdAt,
      customer: {
        name: order.user ? order.user.name : 'Unknown',
        email: order.user ? order.user.email : '',
        phone: order.user ? order.user.phone : ''
      },
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: order.subtotal || order.totalAmount,
      discountPercent: order.discountPercent || 10,
      discountAmount: order.discountAmount || 0,
      afterDiscount: (order.subtotal || order.totalAmount) - (order.discountAmount || 0),
      gstPercent: order.gstPercent || 5,
      gstAmount: order.gstAmount || 0,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      deliveryMode: order.deliveryMode,
      status: order.status
    };

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/admin/stats — dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();

    let revenue = 0;
    let pending = 0;
    let delivered = 0;

    for (let i = 0; i < orders.length; i++) {
      if (orders[i].status === 'delivered') {
        revenue = revenue + orders[i].totalAmount;
        delivered = delivered + 1;
      }
      if (orders[i].status === 'pending') {
        pending = pending + 1;
      }
    }

    res.json({
      totalOrders: orders.length,
      pendingOrders: pending,
      deliveredOrders: delivered,
      totalRevenue: revenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

module.exports = { getMonthlyRevenue, generateBill, getDashboardStats };
