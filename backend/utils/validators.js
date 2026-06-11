// =====================================================
// VALIDATORS UTILITY — Input Validation Helpers
// =====================================================
// PDF: "Implement client-side form validation using React forms and validators"
// NOTE: We also validate on the SERVER side (defense in depth)
//
// THIS FILE DOES:
// 1. validateEmail()    → Checks if email format is valid
// 2. validatePassword() → Checks minimum length
// 3. validatePhone()    → Checks phone number format
//
// WHY validate on BOTH client AND server?
//   - Client-side: Instant feedback to user (better UX)
//   - Server-side: Security — someone can bypass the frontend
//     (e.g., using Postman or curl to send requests directly)
//   - Alternative: Validate only on server
//     → Works but bad UX — user has to wait for server response
// =====================================================

// Simple email validation using regex
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password must be at least 6 characters
const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Indian phone number validation (10 digits)
const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

module.exports = { validateEmail, validatePassword, validatePhone };
