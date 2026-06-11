// =====================================================
// ROLE MIDDLEWARE — Checks if user is admin
// =====================================================

const adminOnly = (req, res, next) => {
  // Simple check: is the user an admin?
  if (req.user && req.user.role === 'admin') {
    next(); // Yes, allow access
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

module.exports = { adminOnly };
