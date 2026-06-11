// =====================================================
// SERVER.JS — Entry Point of the Backend Application
// =====================================================
// PDF Reference: "Create a Node.js project" + "Set up Express.js to handle routing and middleware"
//
// THIS FILE DOES:
// 1. Loads environment variables from .env file
// 2. Connects to MongoDB database
// 3. Sets up Express middleware (CORS, JSON parsing)
// 4. Mounts all route files (auth, menu, orders, payment, admin)
// 5. Starts the server on the configured port
//
// WHY Express?
//   - Most popular Node.js web framework, huge community support
//   - Simple routing, middleware system, easy to learn
//   - Alternative: Fastify (faster performance) or Koa (lighter, by Express creators)
//
// WHY this file is kept minimal?
//   - Single Responsibility: server.js only "wires things together"
//   - Actual logic lives in controllers/, routes/, middleware/
//   - Makes it easy to test individual parts without starting the whole server
// =====================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ----- MIDDLEWARE -----
// cors() → Allows frontend (running on port 5173) to talk to backend (port 5000)
// express.json() → Parses incoming JSON request bodies (e.g., login form data)
app.use(cors());
app.use(express.json());

// ----- ROUTES -----
// Each route file handles a group of related endpoints
// PDF: "Ensure APIs are RESTful and follow best practices"

// Auth routes: register, login, get profile
// PDF: "CRUD on User and Admin (login, logout, register)"
app.use('/api/auth', require('./routes/authRoutes'));

// Menu routes: browse menu, CRUD menu items (admin)
// PDF: "As an admin, I should be able to do CRUD on the items available in the menu"
// PDF: "As a user, I should be able to see the different categories of the menu"
app.use('/api/menu', require('./routes/menuRoutes'));

// Order routes: place, cancel, view orders
// PDF: "As an user, I should be able to place / cancel the order"
// PDF: "As an admin, I can accept or reject the order"
app.use('/api/orders', require('./routes/orderRoutes'));

// Payment routes: dummy payment gateway with coupon code
// PDF: "As a user, I should be able to see the bill amount for the order along with payment options"
app.use('/api/payment', require('./routes/paymentRoutes'));

// Admin routes: revenue, order management, billing
// PDF: "As an admin, I should be able to see the monthly revenue of the shop"
// PDF: "As an admin, I should be able to generate the bill of particular user"
app.use('/api/admin', require('./routes/adminRoutes'));

// AI routes: smart description, reviews, recommendations
// Extra feature: Gemini AI integration
app.use('/api/ai', require('./routes/aiRoutes'));

// ----- START SERVER -----
const PORT = process.env.PORT || 5000;

// Only start listening when running directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Pizzeria server running on port ${PORT}`);
  });
}

// Export app for testing with supertest
module.exports = app;
