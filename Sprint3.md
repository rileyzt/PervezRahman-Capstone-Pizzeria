# Sprint 3 — What I Did, Why I Did It, and How to Explain It

## What was the goal of Sprint 3?

Core areas of development:
1. **AI-Powered Description Generator**: Admin can auto-generate mouthwatering menu item descriptions using the Gemini AI API with a single click.
2. **AI Sentiment Analysis on Customer Reviews**: When a customer submits a review on a delivered order, the backend automatically analyzes the sentiment (positive, neutral, or negative) using Gemini AI, and the admin dashboard shows aggregated sentiment stats.
3. **AI Smart Menu Recommendation**: Customers can describe what they are in the mood for (e.g., "something spicy and vegetarian") in a text bar on the menu page, and Gemini AI recommends the top matching menu items (with a local keyword-matching fallback if the API fails).
4. **Automated Order Status Progression**: After an order is placed, the status automatically transitions every 3 seconds (Pending -> Accepted -> Preparing -> Out for Delivery -> Delivered) using backend setTimeout chains, simulating kitchen-to-doorstep execution for live demos.
5. **AI Support Chatbot with Hybrid Fallback**: A floating chat widget in the bottom-right corner of every page lets customers ask questions like "Where is my order?" and receives context-aware answers using their actual order data. If the Gemini API key is depleted, the system falls back to a local rule-based chatbot that still gives accurate responses.
6. **Automated Email Notifications**: Uses Nodemailer and Gmail SMTP to automatically send a professionally styled HTML invoice email to the customer's registered email address (e.g., `pervezonboard@gmail.com`) upon placing an order.
7. **Component and Integration Testing**: Integrated Jest and Supertest to write and run 15 comprehensive unit and endpoint test cases (both positive and negative) validating the billing logic, field validators, status messaging, and API routes.
8. **Production Deployment**: Pushed the repository to GitHub, deployed the backend server on Render, and deployed the frontend application on Vercel with environment variable configuration.

---

## BACKEND FILES — explained

### services/aiService.js — Gemini API Wrapper with Fallback

```js
const axios = require('axios');

const askGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;

  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const response = await axios.post(url, body);
  const text = response.data.candidates[0].content.parts[0].text;
  return text.trim();
};
```
*   **What this does**: Sends a text prompt to Google's Gemini 2.5 Flash model via a simple HTTP POST request and extracts the generated text from the JSON response.
*   **Why axios instead of the Google SDK?**: The official `@google/generative-ai` SDK adds heavy dependencies. A raw axios POST is simpler, lighter, and easier to understand — it is just an HTTP request with a JSON body.
*   **Why `v1beta` endpoint?**: Gemini's latest models (2.5-flash) are served on the `v1beta` API version. The stable `v1` endpoint does not support newer model names.

```js
const generateDescription = async (itemName, category) => {
  try {
    const prompt = 'Write a short 1-line mouthwatering food description (max 15 words) for "' + itemName + '" in category "' + category + '". Only return the description.';
    return await askGemini(prompt);
  } catch (error) {
    console.log('Gemini API depleted or failed, using local description fallback');
    return `A delicious, freshly prepared ${itemName} made with premium ingredients in our traditional stone oven.`;
  }
};
```
*   **Fallback logic**: If the Gemini API returns a 429 (quota exhausted) or any network error, instead of crashing, we return a template-based description using the item name. This ensures the admin panel never shows an error during live demos.

---

### services/notificationService.js — Gmail SMTP Integration

```js
const nodemailer = require('nodemailer');

const sendOrderEmail = async (userEmail, order) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS // 16-character Google App Password
      }
    });
    // Sends a beautifully styled HTML table detailing the order summary, subtotal, discount, GST, and delivery mode...
  } catch (error) { ... }
};
```
*   **What this does**: Establishes a connection with Gmail's SMTP servers and sends a transaction invoice to the user's registered email address immediately when they checkout.
*   **Why Gmail App Passwords?**: Gmail blocked simple username/password authentication. We use a 16-character App Password generated specifically for this application, securing the account while allowing programmatic emails.

---

### controllers/aiController.js — AI Feature Controllers

**`generateItemDescription`**
*   Route: `POST /api/ai/generate-description` (Admin only)
*   Reads `name` and `category` from the request body, calls `generateDescription()`, and returns the AI-generated text.

**`submitReview`**
*   Route: `POST /api/ai/review` (Customer, logged in)
*   Validates that the order exists and is delivered. Checks for duplicate reviews. Calls `analyzeSentiment()` to tag the review. Saves to the `Review` collection.

**`getReviewStats`**
*   Route: `GET /api/ai/reviews` (Admin only)
*   Fetches all reviews, counts positive, neutral, and negative sentiments, and calculates the average rating. Returns stats for the admin dashboard.

**`handleSmartRecommend`**
*   Route: `POST /api/ai/smart-recommend` (Public)
*   Fetches all available menu items. Sends the list + user's query to Gemini AI to find matching items.
*   **Fallback**: If the Gemini API is offline, it splits the query into keywords and ranks items based on how many keywords match the item name, description, or category.

**`handleSupportChat`**
*   Route: `POST /api/ai/chat` (Customer, logged in)
*   Finds the user's latest order from the database. Builds a context-aware prompt with the order's status, items, and total. Calls `askGemini()`. If Gemini fails, falls back to local keyword-matching chatbot logic that reads the order status and the user's message to generate an accurate reply.

---

### routes/aiRoutes.js — AI Route Definitions

```js
router.post('/generate-description', protect, adminOnly, generateItemDescription);
router.post('/review', protect, submitReview);
router.get('/reviews', protect, adminOnly, getReviewStats);
router.get('/recommendations', getRecommendations);
router.post('/chat', protect, handleSupportChat);
router.post('/smart-recommend', handleSmartRecommend);
```
*   **Why is `/smart-recommend` public?**: Customers browsing the menu page can get recommendations without having to log in first.

---

### controllers/orderController.js — Automated Status Timer + Email Hook

```js
const startAutomatedProgression = (orderId) => {
  setTimeout(async () => {
    const order = await Order.findById(orderId);
    if (order && order.status === 'pending') {
      order.status = 'accepted';
      order.statusMessage = 'Your order has been accepted by the kitchen!';
      await order.save();
      
      // ... prepares and delivers order status automatically
    }
  }, 3000);
};
```
*   **What this does**: Automatically increments order status every 3 seconds for demonstration purposes.
*   **Email Hook**: Inside `placeOrder` (when the order is first submitted), the system triggers `sendOrderEmail(req.user.email, order)` to dispatch the HTML invoice, ensuring a single clean transaction email is sent.

---

## TESTING ARCHITECTURE — Jest & Supertest

We implemented **15 test cases** (unit tests + endpoint integration tests) inside `backend/tests/app.test.js`:

1.  **calculateBill() (3 cases)**:
    *   *Positive*: Validates accurate subtotal, 10% discount deduction, 5% GST calculation, and rounded total.
    *   *Negative*: Assures an empty cart returns zero totals.
    *   *Negative*: Tests system-error resilience against zero-priced and negative-priced menu items.
2.  **validateEmail() (2 cases)**:
    *   *Positive*: Accepts standard format (`user@domain.com`).
    *   *Negative*: Rejects empty string, missing `@`, and missing domains.
3.  **validatePassword() (3 cases)**:
    *   *Positive*: Accepts passwords $\ge 6$ characters.
    *   *Negative*: Rejects passwords $< 6$ characters, empty string, and null/undefined values.
4.  **getStatusMessage() (2 cases)**:
    *   *Positive*: Returns correct status updates for active tracker states.
    *   *Negative*: Resolves unknown/undefined states to a default "pending" message.
5.  **GET /api/menu (1 case)**:
    *   *Positive*: Ensures the public menu route resolves with status 200 and returns an array.
6.  **POST /api/auth/login (2 cases)**:
    *   *Negative*: Rejects incorrect passwords with status 401.
    *   *Negative*: Rejects unregistered email addresses with status 401.

*Tests can be executed at any time in the backend root using `npm test`.*

---

## PRODUCTION DEPLOYMENT

The application is deployed using a modern decoupled architecture:

### 1. Backend Server (Render.com)
*   **Live Endpoint**: `https://pizzeria-backend-usyv.onrender.com/`
*   **Why Render?**: Unlike Vercel (which runs serverless functions that terminate after 10 seconds), Render hosts a persistent Node.js runtime environment. This guarantees that our background `setTimeout` order tracking progression runs completely without getting killed.
*   **MongoDB Network Configuration**: Whitelisted access from anywhere (`0.0.0.0/0`) in MongoDB Atlas to allow Render's dynamic application servers to connect.

### 2. Frontend Application (Vercel)
*   **Live App URL**: `https://pizzeria-lake.vercel.app/`
*   **Why Vercel?**: Provides lightning-fast global CDN hosting for React static single-page apps.
*   **API Connection**: Configured with the environment variable `VITE_API_URL` pointing to the Render backend.

---

## STATUS SUMMARY

| Feature | Status | Location |
| :--- | :--- | :--- |
| **AI Description Generator** | Done | Backend: `aiController.js` (L9-23). Frontend: `ManageMenu.jsx` (L46-93). |
| **AI Sentiment Analysis** | Done | Backend: `aiController.js` (L26-108). Frontend: `OrderStatus.jsx` (L137-171), `AdminDashboard.jsx`. |
| **AI Smart Recommendations** | Done | Backend: `aiController.js` (L240-308). Frontend: `Menu.jsx` (L50-98). |
| **Automated Order Timer** | Done | Backend: `orderController.js` (L10-57). |
| **AI Support Chatbot** | Done | Backend: `aiController.js` (L146-238). Frontend: `SupportChat.jsx`. |
| **Gmail SMTP Notifications** | Done | Backend: `notificationService.js`, `orderController.js` (L100-102). |
| **API & Unit Testing** | Done | Backend: `tests/app.test.js`, Output: `outputs/test-results.txt`. |
| **Production Deployment** | Done | Render (Backend) + Vercel (Frontend). |

---

## QUESTIONS A TEACHER WOULD ASK (AND HOW TO ANSWER)

### On AI Integration
**Q: Why did you use Gemini's REST API instead of the official Google SDK?**
A: The SDK adds unnecessary dependency bloat to our Node application. A simple Axios POST request to the API endpoint is cleaner, runs faster, and achieves the exact same results with less overhead.

**Q: What is the USP (Unique Selling Proposition) of your app compared to Zomato or Domino's?**
A: Most food delivery platforms just show star ratings and basic text filters. Our platform integrates **AI Smart Recommendation**, letting customers search using natural language (e.g. "suggest something light and spicy for dinner") rather than click generic filters. We also run **AI Sentiment Analysis** on reviews to automatically classify customer feedback for the admin dashboard.

---

### On testing
**Q: Why write both positive and negative test cases?**
A: Positive test cases confirm that the code works under expected conditions. Negative test cases prove that the code is robust and fails gracefully when given bad inputs (e.g., negative prices, malformed emails, short passwords), preventing backend crashes.

---

### On Deployment
**Q: Why did you host the backend on Render instead of Vercel?**
A: Vercel runs backend code as serverless functions. These functions are stateless and have a strict execution time limit (usually 10 seconds). Because our order status progression takes 12 seconds in total (updating status every 3 seconds), Vercel's serverless runtime would kill the process before completion. Render provides a persistent Node server that keeps the background processes running perfectly.
