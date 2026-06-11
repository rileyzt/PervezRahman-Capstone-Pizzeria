# Sprint 2 — What I Did, Why I Did It, and How to Explain It

## What was the goal of Sprint 2?

Four core areas of development:
1. **Menu Management & Search**: Implement full CRUD operations for menu items (admin can add, edit, delete items) and client/server-side search capability for customers.
2. **Order Lifecycle & Customer Control**: Implement placing orders, updating status, and allowing customers to cancel orders that are still pending.
3. **Cart & Checkout Experience**: Create the client-side cart system (adding/removing items, updating quantities) and checkout page (delivery/pickup choices and address input).
4. **Billing & Receipt Generation**: Implement automatic bill calculations (calculating a 10% discount and 5% GST) and a printable receipt page for admins.

---

## BACKEND FILES — explained line by line

### routes/menuRoutes.js — Mapping Menu Operations
```js
const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItem, searchMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.get('/', getMenuItems);
router.get('/search', searchMenu);
router.get('/:id', getMenuItem);

// Admin-only operations
router.post('/', protect, adminOnly, createMenuItem);
router.put('/:id', protect, adminOnly, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
```
*   **What this does**: Maps incoming HTTP requests (GET, POST, PUT, DELETE) to the corresponding controller functions.
*   **Why authentication middleware here?**: Browsing the menu (`GET /`) is public—anyone can see food. But adding (`POST`), editing (`PUT`), or deleting (`DELETE`) menu items is protected. We chain `protect` (checks token) and `adminOnly` (checks if user is admin) to block unauthorized users.

---

### controllers/menuController.js — Menu Business Logic
```js
const MenuItem = require('../models/MenuItem');

// GET /api/menu?category=pizza
const getMenuItems = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category, isAvailable: true } : { isAvailable: true };
    const items = await MenuItem.find(filter);
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
};

// GET /api/menu/search?q=margherita
const searchMenu = async (req, res) => {
  try {
    const { q } = req.query;
    const items = await MenuItem.find({
      name: { $regex: q, $options: 'i' },
      isAvailable: true
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error searching menu', error: error.message });
  }
};
```
*   **`$regex` and `$options: 'i'`**: Enables a case-insensitive search (e.g., matching "margherita" or "Margherita" or just "marg").
*   **`isAvailable: true`**: Instead of hard-deleting items that we no longer sell, we filter out unavailable items so old order receipts referencing those IDs do not break (soft deletion).

```js
// POST /api/menu (Admin Only)
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      image,
      createdBy: req.user._id // attached by authMiddleware
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu item', error: error.message });
  }
};
```
*   **`createdBy: req.user._id`**: Logs which admin created this item for audit tracking.

---

### controllers/orderController.js — Order Lifecycle
```js
// POST /api/orders — Customer places a new order
const placeOrder = async (req, res) => {
  try {
    const { items, deliveryMode, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // calculate bill (subtotal, 10% discount, 5% GST, total)
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

    // Start automated progress simulator (3s transitions for demo)
    startAutomatedProgression(order._id);

    res.status(201).json(formatOrderResponse(order));
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
};
```
*   **`startAutomatedProgression`**: Triggers a sequence of background timeouts that cycle the order automatically: `Pending` $\rightarrow$ `Accepted` $\rightarrow$ `Preparing` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered` to simulate kitchen execution for live demos.
*   **`calculateBill`**: Encapsulates tax and discount math, ensuring calculations match standard billing compliance (10% discount, 5% GST).

```js
// PUT /api/orders/:id/cancel — Customer cancels order (only if pending)
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel. Order is already ${order.status}` });
    }

    order.status = 'cancelled';
    order.statusMessage = 'Order has been cancelled by the customer.';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};
```
*   **Status Check constraint**: Customer can only cancel an order if it is in the `pending` state. If the kitchen has already accepted it, cancellation is blocked.

---

### services/orderService.js — Decoupled Math Calculations
```js
const calculateBill = (items) => {
  // calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // 10% discount
  const discountPercent = 10;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  // 5% GST on the discounted price
  const gstPercent = 5;
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = Math.round(taxableAmount * (gstPercent / 100));

  // total
  const totalAmount = taxableAmount + gstAmount;

  return { subtotal, discountPercent, discountAmount, gstPercent, gstAmount, totalAmount };
};
```
*   **Why keep this here?**: Separates math logic from HTTP route controllers. This makes the code cleaner, reusable, and easy to unit test.

---

## FRONTEND FILES — explained

### pages/Menu.jsx — Searching & Filtering
*   **Search bar State**: Implements a search bar input. When the user types, it updates `searchQuery` and triggers an API search call:
    ```javascript
    const handleSearch = async (query) => {
      const response = await searchMenu(query);
      setMenuItems(response.data);
    };
    ```
*   **Category filter tabs**: Displays categories (Pizza, Sides, Beverages, Combo, New Launches, Bestsellers) matching PDF specs. Clicking a tab triggers a filtered API request: `getMenuItems(category)`.

### pages/Cart.jsx — Client-Side Cart Manager
*   **Global Cart Context**: Uses `CartContext` to hold item quantities.
*   **Quantity increment/decrement**: Buttons calling `addToCart(item)` or `removeFromCart(itemId)` that recalculate totals instantly on the client side.
*   **PDF alignment**: Fulfills the "view bill amount" requirement and allows selecting multiple items.

### pages/Checkout.jsx — Order Submission Gating
*   **Delivery Toggles**: Let's the user choose between "Home Delivery" and "Store Pickup" (aligns with User Story 7).
*   **Recalculation Display**: Visualizes the subtotal, 10% discount, 5% GST, and final pay amount before they click checkout.

### pages/admin/ManageMenu.jsx — Menu Manager (CRUD)
*   **Add Item Form**: Input fields for name, price, description, category, image, and availability toggles.
*   **AI Generate Button**: Leverages the Gemini API backend integration to generate a short, mouthwatering description for the food item instantly with one click.
*   **CRUD list view**: Shows all menu items with "Edit" and "Delete" actions mapped to `updateMenuItem` and `deleteMenuItem`.

### pages/admin/GenerateBill.jsx — Billing Receipt View
*   **Receipt Template**: Displays a printable invoice with billing details, order timestamp, user name, and the items purchased.
*   **PDF alignment**: Aligns with Admin Story 5: *"Generate the bill of a particular user based on the selected order."*

---

## WHAT'S DONE vs WHAT'S LEFT

| Requirement | Sprint 2 Status | Implementation details |
| :--- | :--- | :--- |
| **Search Menu** | **Done** | Customer can search items by name or keywords on the `/menu` route. |
| **Menu CRUD (Admin)** | **Done** | Admin can create, read, update, delete items on the `/admin/menu` route. |
| **Cancel Order** | **Done** | Customers can cancel pending orders directly from their order history list. |
| **Billing Options** | **Done** | Invoices generated automatically with 10% discount and 5% GST applied. |
| **Accept/Reject Order** | **Done** | Admin panel has buttons to change status; custom messages update database. |
| **Order Progress Timeline**| **Done** | Dynamic stepper updates status step-by-step automatically every 3 seconds. |
| **Dummy Payment gateway** | **Done** | Process coupon code check "WIPRO" to complete orders. (Sprint 3 objective) |
| **Monthly Revenue** | **Done** | Admin analytics dashboard displays total cash flow and delivered orders. (Sprint 3 objective) |

---

## QUESTIONS A SENIOR ENGINEER / TEACHER WOULD ASK (AND HOW TO ANSWER)

### On Database design and population
**Q: What is the difference between SQL `JOIN` and Mongoose `.populate()`?**
A: SQL joins combine rows from two tables at query time on the database server. MongoDB is non-relational and does not support traditional relational joins. Instead, Mongoose `.populate()` executes a second query under the hood to fetch the related documents (e.g., retrieving the user's name and email for an order record) and replaces the ID reference with the actual document object.

**Q: Why do you store the price inside the order's item list instead of referencing the menu item price?**
A: This is called **denormalization**. If a pizza's price changes next week (from ₹299 to ₹349), the old order's total must remain ₹299. If we only referenced the menu item ID, looking up the price retrospectively would display incorrect totals. Storing the price snapshot at the moment of checkout guarantees the invoice remains forever accurate.

---

### On Business Logic & Security
**Q: How do you prevent a regular customer from adding or deleting menu items via API?**
A: We protect those endpoints using two stacked Express middleware functions:
1. `protect`: Decodes the user's JWT token to verify identity and sets `req.user`.
2. `adminOnly`: Checks if `req.user.role === 'admin'`. If the role is `'customer'`, it rejects the request immediately with a `403 Forbidden` status code, preventing execution of the controller code.

**Q: Why use regex for search instead of exact matches?**
A: Exact matches would require users to type names perfectly (e.g., typing "Italian Margherita Pizza" instead of just "Margherita"). Mongoose's `$regex` operator matches any substring containing the search query, and the `$options: 'i'` flag ensures it remains case-insensitive.

---

### On Frontend State & UX
**Q: Why did you choose React Context for cart management?**
A: A user's cart needs to be updated from the Menu page, reviewed on the Cart page, and sent during checkout. Passing this state down manually through props (prop-drilling) would make the code messy. `CartContext` acts as a global state provider wrapping our entire app router, allowing any component to subscribe to the cart items easily using `useCart()`.

**Q: How does client-side search compare to server-side search in terms of scale?**
A: Client-side search is faster for small menus because it filters an array already loaded in browser memory. However, for large menus (thousands of items), fetching the entire list would crash the client. Server-side search (`GET /api/menu/search`) queries the database directly using indexes, transferring only relevant matches over the network, which is highly scalable.
