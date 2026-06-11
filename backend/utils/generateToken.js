// GENERATE TOKEN UTILITY - Creates JWT Token
// PDF: "Implement session management using JSON Web Tokens (JWT)"
//
// THIS FILE DOES:
// 1. Takes user's id and role as input
// 2. Creates a JWT token signed with our secret key
// 3. Sets expiry time from .env (default: 24 hours)
//
// WHAT'S INSIDE THE TOKEN (payload):
//  by example - { id: "user_mongo_id", role: "customer" or "admin" }
//   - id - so we know WHICH user this token belongs to
//   - role - so middleware can check admin access without DB query

const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },                    // Payload - data stored in token
    process.env.JWT_SECRET,          // Secret key - used to sign/verify
    { expiresIn: process.env.JWT_EXPIRE || '24h' }  // Expiry
  );
};

module.exports = { generateToken };
