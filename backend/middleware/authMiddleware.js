// =====================================================
// AUTH MIDDLEWARE — Checks if user is logged in
// =====================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Step 1: Get the token from the request header
    const authHeader = req.headers.authorization;

    // Step 2: Check if token exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Not logged in. Please login first.' });
    }

    // Step 3: Extract the token (remove "Bearer " from the start)
    const token = authHeader.split(' ')[1];

    // Step 4: Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: Find the user and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    // Step 6: Move to the next function (the actual route handler)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired. Please login again.' });
  }
};

module.exports = { protect };
