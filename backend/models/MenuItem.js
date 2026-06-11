// =====================================================
// MENUITEM MODEL — MongoDB Schema for Pizza Menu Items
// =====================================================
// PDF Reference: "As an admin, I should be able to do CRUD on the items available in the menu"
// PDF Reference: "As a user, I should be able to see the different categories of the menu 
//                 like pizza, sides, beverages, combo, new launches, bestsellers"
//
// THIS FILE DOES:
// 1. Defines the MenuItem schema (name, price, category, image, etc.)
// 2. Categories match EXACTLY what the PDF requires
// 3. Links each item to the admin who created it (via ObjectId reference)
//
// DESIGN DECISION — Categories as enum:
//   - Using enum ensures only valid categories are stored
//   - Alternative: Separate 'Category' collection with references
//     → Overkill for 6 fixed categories. Enum is simpler and faster (no extra DB query)
//
// DESIGN DECISION — Image stored as URL string:
//   - We store the image URL (not the actual image binary)
//   - Alternative: Store image in MongoDB as Buffer (GridFS)
//     → But URLs are simpler, and we can use free image hosting or local paths
// =====================================================

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

  // Which admin created this item — ObjectId reference to User collection
  // WHY reference instead of embedding admin info?
  //   - If admin updates their name, we don't need to update every menu item
  //   - Keeps documents small and normalized
  //   - Alternative: Embed admin name directly (denormalization)
  //     → Faster reads but harder to keep in sync
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
