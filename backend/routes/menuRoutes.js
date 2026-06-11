// =====================================================
// MENU ROUTES — Browse & Manage Menu Items
// =====================================================
// PDF Reference: "As an admin, I should be able to do CRUD on the items available in the menu"
// PDF Reference: "As a user, I should be able to see the different categories of the menu"
// PDF Reference: "Develop search functionality based on different criteria"
//
// THIS FILE DOES:
// 1. Public routes — anyone can browse the menu (no login required)
// 2. Admin-only routes — create, update, delete menu items
// 3. Search/filter by category
//
// ROUTE DESIGN:
//   GET    /api/menu          → Get all menu items (with optional category filter)
//   GET    /api/menu/:id      → Get single menu item details
//   POST   /api/menu          → Create new menu item (admin only)
//   PUT    /api/menu/:id      → Update menu item (admin only)
//   DELETE /api/menu/:id      → Delete menu item (admin only)
//   GET    /api/menu/search   → Search menu items by name/category
// =====================================================

const express = require('express');
const router = express.Router();
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  searchMenuItems
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// --- PUBLIC ROUTES (no login required) ---

// GET /api/menu → Browse all menu items
// Supports query parameter: ?category=pizza or ?category=beverages
// PDF: "As a user, I should be able to see the different categories"
router.get('/', getAllMenuItems);

// GET /api/menu/search?q=margherita → Search menu items
// PDF: "Develop search functionality based on different criteria"
router.get('/search', searchMenuItems);

// GET /api/menu/:id → View single item details
router.get('/:id', getMenuItemById);

// --- ADMIN-ONLY ROUTES (requires login + admin role) ---

// POST /api/menu → Add new item to menu
// PDF: "As an admin, I should be able to do CRUD on the items — CREATE"
router.post('/', protect, adminOnly, createMenuItem);

// PUT /api/menu/:id → Update existing item
// PDF: "As an admin, I should be able to do CRUD on the items — UPDATE"
router.put('/:id', protect, adminOnly, updateMenuItem);

// DELETE /api/menu/:id → Remove item from menu
// PDF: "As an admin, I should be able to do CRUD on the items — DELETE"
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
