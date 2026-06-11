// USER MODEL - MongoDB Schema for Users & Admins
// PDF Reference: "Design appropriate collections to store user and application information"
// PDF Reference: "There are 2 users in the application - 1. Admin  2. Customer"
//
// THIS FILE DOES:
// 1. Defines the User schema 
// 2. Hashes the password before saving (using bcrypt)

// DESIGN DECISION - Single collection with 'role' field:
//   - Both Admin and Customer share the same fields (name, email, password)
//   - Using one collection with a 'role' field avoids duplicate code

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // User's full name - required for display and billing
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  // Email - used as the unique login identifier
  // PDF: "As a user, I should be able to register, login, and logout"
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },

  // Password - stored as a bcrypt hash, NEVER plain text
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Role - determines what the user can do in the app
  // 'customer' - can browse menu, place orders, view bills
  // 'admin' - can manage menu items, accept/reject orders, see revenue
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  // Phone number - needed for delivery contact
  phone: {
    type: String,
    default: ''
  },

  // Delivery address - where to deliver the pizza
  // PDF: "As a user, I should be able to see the mode of delivery"
  address: {
    type: String,
    default: ''
  },

  // Timestamp - when the account was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//PRE-SAVE MIDDLEWARE 
// This runs BEFORE every save() call on a User document
// It hashes the password so we never store plain text passwords

userSchema.pre('save', async function () {
  // Only hash if password was modified (not on every save, e.g., updating name)
  if (!this.isModified('password')) return;

  // Generate salt (random data) with 10 rounds of processing
  const salt = await bcrypt.genSalt(10);
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
});

//Compare Password 
// Used during login to check if entered password matches stored hash
// bcrypt.compare() comparison internally
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
