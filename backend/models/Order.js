// =====================================================
// ORDER MODEL — MongoDB Schema for Customer Orders
// =====================================================
// PDF Reference: "As an user, I should be able to place / cancel the order"
// PDF Reference: "As an admin, I can accept or reject the order from the user/users"
// PDF Reference: "As a user, I should be able to see the bill amount for the order along with payment options"
// PDF Reference: "As a user, I should be able to see the mode of delivery"
// PDF Reference: "As an admin, I should be able to generate the bill of particular user"
// PDF Reference: "As an admin, I should be able to send the message or pop up to users on order status"
//
// THIS FILE DOES:
// 1. Stores which user placed the order (ObjectId reference)
// 2. Stores the list of items ordered (with quantity and price snapshot)
// 3. Tracks order status through its lifecycle (pending → accepted → preparing → delivered)
// 4. Stores payment info (method, coupon code, payment status)
// 5. Stores delivery mode (pickup vs delivery)
//
// DESIGN DECISION — Price snapshot in order items:
//   - We store the price AT THE TIME of ordering inside the order
//   - WHY? If admin changes menu price later, old orders should show original price
//   - Alternative: Only store menuItem reference and look up current price
//     → Wrong! Customer would see different bill amounts after price changes
//
// DESIGN DECISION — Status as enum with fixed values:
//   - Clear lifecycle: pending → accepted → preparing → out_for_delivery → delivered
//   - Admin can also 'reject' or customer can 'cancel'
//   - Alternative: Boolean flags (isAccepted, isPreparing, isDelivered)
//     → Messy with multiple booleans, enum is cleaner
// =====================================================

const mongoose = require('mongoose');

// Sub-schema for individual items in an order
// Each item stores: which menu item, how many, and the price at that time
const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false }); // _id: false → don't create separate _id for each sub-document

const orderSchema = new mongoose.Schema({
  // Which customer placed this order
  // PDF: "As an user, I should be able to place / cancel the order"
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // List of items in the order
  // PDF: "As a user, I should be able to select more than one item from the same category or different category"
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function (items) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },

  // Subtotal (sum of all items before discount/GST)
  subtotal: {
    type: Number,
    default: 0
  },

  // 10% discount
  discountPercent: { type: Number, default: 10 },
  discountAmount: { type: Number, default: 0 },

  // 5% GST
  gstPercent: { type: Number, default: 5 },
  gstAmount: { type: Number, default: 0 },

  // Final total (subtotal - discount + GST)
  totalAmount: {
    type: Number,
    required: true
  },

  // Order lifecycle status
  // PDF: "As an admin, I can accept or reject the order"
  // PDF: "Once the order is placed I should be able to receive message or pop up on the order status"
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'rejected', 'cancelled'],
    default: 'pending'
  },

  // Admin message / status update message to customer
  // PDF: "As an admin, I should be able to send the message or pop up to users on order status"
  statusMessage: {
    type: String,
    default: ''
  },

  // Payment information
  // PDF: "As a user, I should be able to see the bill amount for the order along with payment options"
  paymentMethod: {
    type: String,
    enum: ['coupon', 'cash_on_delivery', 'online'],
    default: 'coupon'
  },

  // Coupon code used for dummy payment gateway
  // If coupon code is "WIPRO", payment is considered done
  couponCode: {
    type: String,
    default: ''
  },

  // Whether payment has been completed
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },

  // Delivery mode
  // PDF: "As a user, I should be able to see the mode of delivery"
  deliveryMode: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },

  // Delivery address (copied from user profile or entered at checkout)
  deliveryAddress: {
    type: String,
    default: ''
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
