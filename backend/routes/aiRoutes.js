// AI ROUTES — all AI-powered feature endpoints

const express = require('express');
const router = express.Router();
const {
  generateItemDescription,
  submitReview,
  getReviewStats,
  getRecommendations,
  handleSupportChat,
  handleSmartRecommend
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// POST /api/ai/generate-description — admin generates AI description (admin only)
router.post('/generate-description', protect, adminOnly, generateItemDescription);

// POST /api/ai/review — customer submits a review (logged in)
router.post('/review', protect, submitReview);

// GET /api/ai/reviews — admin sees all reviews with sentiment stats
router.get('/reviews', protect, adminOnly, getReviewStats);

// GET /api/ai/recommendations?categories=pizza,sides — get smart recommendations
router.get('/recommendations', getRecommendations);

// POST /api/ai/chat — customer chats with support AI agent (logged in)
router.post('/chat', protect, handleSupportChat);

// POST /api/ai/smart-recommend — AI recommends items based on mood/preference
router.post('/smart-recommend', handleSmartRecommend);

module.exports = router;
