// MENUITEM MODEL - MongoDB Schema for Pizza Menu Items

// PDF Reference: "As an admin, I should be able to do CRUD on the items available in the menu"
// PDF Reference: "As a user, I should be able to see the different categories of the menu 
//                 like pizza, sides, beverages, combo, new launches, bestsellers"
//
// THIS FILE DOES:
// 1. Defines the MenuItem schema (name, price, category, image, etc.)
// 2. Links each item to the admin who created it (via ObjectId reference)
//
// DESIGN DECISION - Categories as enum:
//   - Using enum ensures only valid categories are stored
// - Image stored as URL string:
//   - We store the image URL 


const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  // Item name — e.g., "Margherita Pizza", "Garlic Bread"
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },

  // Description — what's in the item
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },

  // Price in INR
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },

  // Category — must be one of the 6 categories from the PDF
  // PDF: "pizza, sides, beverages, combo, new launches, bestsellers"
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['pizza', 'sides', 'beverages', 'combo', 'new_launches', 'bestsellers']
  },

  // Image URL for the item display
  image: {
    type: String,
    default: ''
  },

  // Whether the item is currently available to order
  // Admin can toggle this without deleting the item
  isAvailable: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // When the item was added to the menu
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
