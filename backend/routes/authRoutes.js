// =====================================================
// AUTH ROUTES — Register, Login, Get Profile
// =====================================================
// PDF Reference: "CRUD on User and Admin (login, logout, register)"
// PDF Reference: "Implement APIs for user authentication (register, login, logout)"
//
// THIS FILE DOES:
// 1. Defines 3 routes for authentication
// 2. Maps each route to its controller function
// 3. Applies auth middleware to protected routes (profile)
//
// WHY separate routes from controllers?
//   - Routes define WHAT URLs exist and WHICH middleware runs
//   - Controllers define WHAT HAPPENS when a route is hit
//   - This separation makes code testable and organized
//   - Alternative: Put logic directly in route handlers
//     → Works for tiny apps, but becomes messy as app grows
// =====================================================

const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register → Create a new user account
// Public route — anyone can register
// PDF: "As a user, I should be able to register"
router.post('/register', register);

// POST /api/auth/login → Authenticate user and return JWT token
// Public route — anyone can attempt login
// PDF: "As a user, I should be able to login"
router.post('/login', login);

// GET /api/auth/profile → Get logged-in user's information
// Protected route — requires valid JWT token
// The 'protect' middleware verifies the token before this runs
router.get('/profile', protect, getProfile);

module.exports = router;
