// AUTH MIDDLEWARE - Checks if user is logged in
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Get the token from the request header
    const authHeader = req.headers.authorization;
    // Check if token exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Not logged in. Please login first.' });
    }

    //  Extract the token (remove "Bearer " from the start)
    const token = authHeader.split(' ')[1];

    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user and attach to request
    req.user = await User.findById(decoded.id).select('-password');

    // Move to the next function (the actual route handler)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired. Please login again.' });
  }
};

module.exports = { protect };
