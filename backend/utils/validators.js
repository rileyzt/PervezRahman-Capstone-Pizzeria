// VALIDATORS UTILITY - Input Validation Helpers
// PDF: "Implement client-side form validation using React forms and validators"
// THIS FILE DOES:
// 1. validateEmail()    - Checks if email format is valid
// 2. validatePassword() - Checks minimum length
// 3. validatePhone()    - Checks phone number format


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
