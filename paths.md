# Pizzeria — Route Mapping & PDF Compliance Matrix

This document provides a complete guide to all Frontend routes, Backend APIs, and Database structures in the Pizzeria MERN application, mapping each to the corresponding requirements in the PDF specification.

---

## 🖥️ Frontend Routes (React SPA)
All frontend pages run as a Single Page Application (SPA) using React Router without page refreshes.

| URL Path | Access Level | UI/UX Elements | Satisfies PDF Requirement |
|:---|:---|:---|:---|
| `/` | **Public** | Brand Hero section, category buttons, quick statistics. | **Sprint I-3:** Create template using React.<br>**User Story 7:** Mode of delivery check. |
| `/login` | **Public** | Form inputs for email & password, Sign In button. | **Admin Story 1 & User Story 1:** Sign in flow.<br>**Instruction 7:** Client-side validation. |
| `/register` | **Public** | Form inputs for name, email, password, confirm password, phone. | **User Story 1:** Sign up flow.<br>**Instruction 7:** Client-side password validation. |
| `/menu` | **Public** | Search bar, category filter tabs, grid of item cards. | **User Story 2:** 7 categories (pizza, sides, beverages, combo, new launches, bestsellers).<br>**User Story 3:** Select multiple items.<br>**Sprint II-1:** Search functionality. |
| `/cart` | **Customer** | List of items, +/- quantity controllers, clear cart, total, checkout. | **User Story 3:** Select multiple items.<br>**User Story 6:** View bill amount. |
| `/checkout` | **Customer** | Bill summary (discount, GST), Delivery/Pickup toggles, address field. | **User Story 6:** Bill amount details.<br>**User Story 7:** Mode of delivery. |
| `/payment/:orderId` | **Customer** | Coupon entry box, "WIPRO" simulation coupon hint. | **User Story 6:** Payment options.<br>**Sprint III-6:** Payment mode service. |
| `/orders` | **Customer** | List of placed orders, cancel buttons for pending orders. | **User Story 4:** Place/cancel order.<br>**Sprint II-3:** Cancel order. |
| `/order/:id` | **Customer** | Step-by-step order tracking progress bar, status notifications. | **User Story 5:** Receive status message/pop up. |
| `/profile` | **Customer** | User details (name, email, role, phone, address). | **Instruction 3.2:** Profile components. |
| `/admin` | **Admin Only** | Overview stats (Total orders, pending, delivered, revenue), links. | **Sprint III-4:** Admin controller REST routes. |
| `/admin/menu` | **Admin Only** | Form to add items (name, category, price, image), list with Edit/Delete. | **Admin Story 2:** Menu CRUD.<br>**Sprint II-2:** Menu CRUD for Admin. |
| `/admin/orders` | **Admin Only** | Status filter tabs, Accept/Reject buttons, progress updates. | **Admin Story 3:** Accept/reject orders.<br>**Admin Story 4:** Send status message. |
| `/admin/bill/:orderId` | **Admin Only** | Printable receipt with item breakdown, 10% discount, 5% GST. | **Admin Story 5:** Generate bill of particular user.<br>**Sprint II-4:** Billing option. |
| `/admin/revenue` | **Admin Only** | Stats cards, delivered orders table with link to bills. | **Admin Story 6:** Monthly revenue of shop. |

---

## ⚙️ Backend API Endpoints (Node.js & Express)
All APIs follow RESTful guidelines and return JSON responses.

### 🔑 Authentication Routes (`/api/auth`)
*   **POST `/api/auth/register`**
    *   *Controller:* `authController.js -> registerUser`
    *   *PDF:* User Story 1 (Register)
*   **POST `/api/auth/login`**
    *   *Controller:* `authController.js -> loginUser`
    *   *PDF:* User/Admin Story 1 (Login)

### 🍕 Menu Routes (`/api/menu`)
*   **GET `/api/menu`** (Optional query: `?category=...`)
    *   *Controller:* `menuController.js -> getMenuItems`
    *   *PDF:* User Story 2 (Categories)
*   **GET `/api/menu/search?q=...`**
    *   *Controller:* `menuController.js -> searchMenu`
    *   *PDF:* Sprint II-1 (Search)
*   **POST `/api/menu`** (Admin only)
    *   *Controller:* `menuController.js -> createMenuItem`
    *   *PDF:* Admin Story 2 (Create menu item)
*   **PUT `/api/menu/:id`** (Admin only)
    *   *Controller:* `menuController.js -> updateMenuItem`
    *   *PDF:* Admin Story 2 (Update menu item)
*   **DELETE `/api/menu/:id`** (Admin only)
    *   *Controller:* `menuController.js -> deleteMenuItem`
    *   *PDF:* Admin Story 2 (Delete menu item)

### 📦 Order Routes (`/api/orders`)
*   **POST `/api/orders`** (Customer only)
    *   *Controller:* `orderController.js -> placeOrder` (Uses `orderService.js`)
    *   *PDF:* User Story 4 (Place order), Sprint III-2 (Service Layer)
*   **GET `/api/orders/my`** (Customer only)
    *   *Controller:* `orderController.js -> getMyOrders`
    *   *PDF:* User Story 4 (View order history)
*   **GET `/api/orders/:id`** (Customer only)
    *   *Controller:* `orderController.js -> getOrderById`
    *   *PDF:* User Story 5 (Track order status)
*   **PUT `/api/orders/:id/cancel`** (Customer only)
    *   *Controller:* `orderController.js -> cancelOrder`
    *   *PDF:* User Story 4 (Cancel order)
*   **GET `/api/orders`** (Admin only)
    *   *Controller:* `orderController.js -> getAllOrders`
    *   *PDF:* Admin Story 3 (Accept/reject order listings)
*   **PUT `/api/orders/:id/status`** (Admin only)
    *   *Controller:* `orderController.js -> updateOrderStatus` (Uses `messageService.js`)
    *   *PDF:* Admin Story 3 & 4 (Update status / send messages)

### 💳 Payment Routes (`/api/payment`)
*   **POST `/api/payment/process`** (Customer only)
    *   *Controller:* `paymentController.js -> processPayment` (Uses `paymentService.js`)
    *   *PDF:* User Story 6 (Payment options), Sprint III-6 (Payment service)

### 📊 Admin Operations (`/api/admin`)
*   **GET `/api/admin/stats`** (Admin only)
    *   *Controller:* `adminController.js -> getDashboardStats`
    *   *PDF:* Sprint III-4 (Admin Controller)
*   **GET `/api/admin/revenue`** (Admin only)
    *   *Controller:* `adminController.js -> getMonthlyRevenue`
    *   *PDF:* Admin Story 6 (Monthly revenue)
*   **GET `/api/admin/bill/:orderId`** (Admin only)
    *   *Controller:* `adminController.js -> generateBill`
    *   *PDF:* Admin Story 5 (Generate bill of particular user)

---

## 🗄️ Database Collections (MongoDB Schemas)

### 1. `users` Collection (`User.js` model)
*   **Fields:** `name`, `email`, `password` (hashed), `role` (`'customer'` / `'admin'`), `phone`, `address`.
*   **PDF:** Sprint I-1 (Schema relationships).

### 2. `menuitems` Collection (`MenuItem.js` model)
*   **Fields:** `name`, `description`, `price`, `category`, `image`, `isAvailable`.
*   **PDF:** Admin Story 2 (Menu management).

### 3. `orders` Collection (`Order.js` model)
*   **Fields:** `user` (ref), `items` (embedded snapshot), `subtotal`, `discountPercent`, `discountAmount`, `gstPercent`, `gstAmount`, `totalAmount`, `status`, `statusMessage`, `paymentMethod`, `couponCode`, `paymentStatus`, `deliveryMode`, `deliveryAddress`.
*   **PDF:** Sprint I-1 (Schema relationships & embedding), Sprint III-8 (Extra features: 10% discount, 5% GST calculation).
