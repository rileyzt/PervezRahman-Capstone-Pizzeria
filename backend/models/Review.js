// REVIEW MODEL — stores customer reviews for delivered orders

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // which order this review is for
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  // which user wrote the review
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // the review text written by the customer
  reviewText: {
    type: String,
    required: true
  },

  // star rating (1 to 5)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // AI-analyzed sentiment (positive, neutral, negative)
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);
