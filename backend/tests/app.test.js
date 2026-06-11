// TEST FILE - Unit Tests + API Tests using Jest & Supertest
// Tests :
//   1. calculateBill() - billing logic (positive + negative)
//   2. validateEmail() - email validation (positive + negative)
//   3. validatePassword() - password validation (positive + negative)
//   4. getStatusMessage() - order status messages (positive + negative)
//   5. GET /api/menu - API endpoint test (positive)
//   6. POST /api/auth/login - API login (positive + negative)
//   7. POST /api/orders - API order placement (negative - empty cart)

const request = require('supertest');
const app = require('../server');
const { calculateBill } = require('../services/orderService');
const { validateEmail, validatePassword } = require('../utils/validators');
const { getStatusMessage } = require('../services/messageService');

// TEST 1: calculateBill - Positive Case
describe('calculateBill - Positive Cases', () => {
  test('Should correctly calculate bill for valid items', () => {
    const items = [
      { name: 'Margherita', price: 200, quantity: 2 },
      { name: 'Garlic Bread', price: 150, quantity: 1 }
    ];

    const bill = calculateBill(items);

    // Subtotal = (200*2) + (150*1) = 550
    expect(bill.subtotal).toBe(550);

    // Discount = 10% of 550 = 55
    expect(bill.discountPercent).toBe(10);
    expect(bill.discountAmount).toBe(55);

    // After discount = 550 - 55 = 495
    expect(bill.afterDiscount).toBe(495);

    // GST = 5% of 495 = 24.75, rounded = 25
    expect(bill.gstPercent).toBe(5);
    expect(bill.gstAmount).toBe(25);

    // Total = 495 + 25 = 520
    expect(bill.totalAmount).toBe(520);
  });

  test('Should calculate bill for a single item', () => {
    const items = [{ name: 'Pizza', price: 300, quantity: 1 }];
    const bill = calculateBill(items);

    expect(bill.subtotal).toBe(300);
    expect(bill.totalAmount).toBeGreaterThan(0);
  });
});

// TEST 2: calculateBill - Negative Cases
describe('calculateBill - Negative Cases', () => {
  test('Should return zero totals for empty cart', () => {
    const items = [];
    const bill = calculateBill(items);

    expect(bill.subtotal).toBe(0);
    expect(bill.totalAmount).toBe(0);
    expect(bill.discountAmount).toBe(0);
    expect(bill.gstAmount).toBe(0);
  });

  test('Should handle zero-priced items', () => {
    const items = [{ name: 'Free Sample', price: 0, quantity: 5 }];
    const bill = calculateBill(items);

    expect(bill.subtotal).toBe(0);
    expect(bill.totalAmount).toBe(0);
  });

  test('Should handle negative price (system error scenario)', () => {
    const items = [{ name: 'Bugged Item', price: -100, quantity: 1 }];
    const bill = calculateBill(items);

    // Even with negative price, function should still compute without crashing
    expect(bill.subtotal).toBe(-100);
    expect(typeof bill.totalAmount).toBe('number');
  });
});

// TEST 3: validateEmail - Positive + Negative
describe('validateEmail', () => {
  test('Positive: Should accept valid email format', () => {
    expect(validateEmail('user@gmail.com')).toBe(true);
    expect(validateEmail('test.name@domain.co.in')).toBe(true);
  });

  test('Negative: Should reject invalid email format', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@gmail.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

// TEST 4: validatePassword - Positive + Negative
describe('validatePassword', () => {
  test('Positive: Should accept password with 6 or more characters', () => {
    expect(validatePassword('password')).toBe(true);
    expect(validatePassword('123456')).toBe(true);
  });

  test('Negative: Should reject password shorter than 6 characters', () => {
    expect(validatePassword('12345')).toBeFalsy();
    expect(validatePassword('ab')).toBeFalsy();
    expect(validatePassword('')).toBeFalsy();
  });

  test('Negative: Should reject null or undefined password', () => {
    expect(validatePassword(null)).toBeFalsy();
    expect(validatePassword(undefined)).toBeFalsy();
  });
});

// TEST 5: getStatusMessage - Positive + Negative
describe('getStatusMessage', () => {
  test('Positive: Should return correct message for valid statuses', () => {
    expect(getStatusMessage('accepted')).toContain('accepted');
    expect(getStatusMessage('delivered')).toContain('delivered');
    expect(getStatusMessage('cancelled')).toContain('cancelled');
  });

  test('Negative: Should return default pending message for unknown status', () => {
    expect(getStatusMessage('flying')).toContain('pending');
    expect(getStatusMessage('')).toContain('pending');
  });
});

// TEST 6: GET /api/menu - API Endpoint (Positive)
describe('GET /api/menu', () => {
  test('Positive: Should return 200 and an array of menu items', async () => {
    const res = await request(app).get('/api/menu');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// TEST 7: POST /api/auth/login - API Endpoint (Positive + Negative)
describe('POST /api/auth/login', () => {
  test('Negative: Should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rileyzt.0ai@gmail.com', password: 'wrongpassword123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('Invalid');
  });

  test('Negative: Should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doesnotexist@test.com', password: 'password' });

    expect(res.statusCode).toBe(401);
  });
});
