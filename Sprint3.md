# Sprint 3 — What I Did, Why I Did It, and How to Explain It

## What was the goal of Sprint 3?

Five core areas of development:
1. **AI-Powered Description Generator**: Admin can auto-generate mouthwatering menu item descriptions using the Gemini AI API with a single click.
2. **AI Sentiment Analysis on Customer Reviews**: When a customer submits a review on a delivered order, the backend automatically analyzes the sentiment (positive, neutral, or negative) using Gemini AI, and the admin dashboard shows aggregated sentiment stats.
3. **Smart Recommendation Engine**: At checkout, the system recommends complementary items (e.g., beverages if the cart has pizza) based on simple category-matching rules.
4. **Automated Order Status Progression**: After an order is placed, the status automatically transitions every 3 seconds (Pending -> Accepted -> Preparing -> Out for Delivery -> Delivered) using backend setTimeout chains, simulating kitchen-to-doorstep execution for live demos.
5. **AI Support Chatbot with Hybrid Fallback**: A floating chat widget in the bottom-right corner of every page lets customers ask questions like "Where is my order?" and receives context-aware answers using their actual order data. If the Gemini API key is depleted, the system falls back to a local rule-based chatbot that still gives accurate responses.

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
*   **Why `v1beta` endpoint?**: Gemini's latest models (2.5-flash, 3.5-flash) are served on the `v1beta` API version. The stable `v1` endpoint does not support newer model names.

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

```js
const analyzeSentiment = async (reviewText) => {
  try {
    const prompt = 'Analyze the sentiment... reply with exactly one word: positive, neutral, or negative.';
    const sentiment = await askGemini(prompt);
    return sentiment.toLowerCase().replace(/[^a-z]/g, '');
  } catch (error) {
    console.log('Gemini API depleted or failed, using local sentiment analysis fallback');
    const text = reviewText.toLowerCase();
    const positiveWords = ['good', 'great', 'delicious', 'love', 'best', 'nice', 'awesome', 'excellent', 'tasty', 'amazing', 'yummy'];
    const negativeWords = ['bad', 'slow', 'cold', 'worst', 'burnt', 'hate', 'terrible', 'disgusting', 'poor', 'expensive', 'late'];
    let score = 0;
    positiveWords.forEach(word => { if (text.includes(word)) score++; });
    negativeWords.forEach(word => { if (text.includes(word)) score--; });
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }
};
```
*   **Local sentiment fallback**: Uses a simple word-matching algorithm. We define two arrays of positive and negative keywords. We scan the review text for matches and calculate a score. Positive score = positive sentiment, negative score = negative sentiment, zero = neutral. This is a beginner-friendly NLP technique called **lexicon-based sentiment analysis**.

---

### models/Review.js — Review Schema

```js
const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  createdAt: { type: Date, default: Date.now }
});
```
*   **Why `enum` for sentiment?**: Restricts the value to exactly three options. If any other string accidentally gets stored, MongoDB will reject it. This is called **schema-level validation**.
*   **Why `ref: 'Order'`?**: Creates a relationship between the Review and Order collections. We can later use `.populate('order')` to fetch the full order details inside a review query.

---

### controllers/aiController.js — AI Feature Controllers

**`generateItemDescription` (Lines 9-23)**
*   Route: `POST /api/ai/generate-description` (Admin only)
*   Reads `name` and `category` from the request body, calls `generateDescription()` from `aiService.js`, and returns the AI-generated text.
*   File: `backend/controllers/aiController.js`, Lines 9-23

**`submitReview` (Lines 26-76)**
*   Route: `POST /api/ai/review` (Customer, logged in)
*   Validates that the order exists and is delivered. Checks for duplicate reviews. Calls `analyzeSentiment()` to tag the review. Saves to the `Review` collection.
*   File: `backend/controllers/aiController.js`, Lines 26-76

**`getReviewStats` (Lines 79-108)**
*   Route: `GET /api/ai/reviews` (Admin only)
*   Fetches all reviews with `.populate('user')` and `.populate('order')`. Counts positive, neutral, and negative sentiments. Calculates the average rating. Returns aggregated stats for the admin dashboard.
*   File: `backend/controllers/aiController.js`, Lines 79-108

**`getRecommendations` (Lines 111-143)**
*   Route: `GET /api/ai/recommendations?categories=pizza,sides`
*   Simple rule-based logic: if the cart has pizza but no beverages, recommend beverages. If it has sides but no pizza, recommend pizza. Fetches 3 available items from the recommended category.
*   File: `backend/controllers/aiController.js`, Lines 111-143

**`handleSupportChat` (Lines 145-240)**
*   Route: `POST /api/ai/chat` (Customer, logged in)
*   Finds the user's latest order from the database. Builds a context-aware prompt with the order's status, items, and total. Calls `askGemini()`. If Gemini fails, falls back to local keyword-matching chatbot logic that reads the order status and the user's message to generate an accurate reply.
*   File: `backend/controllers/aiController.js`, Lines 145-240

---

### routes/aiRoutes.js — AI Route Definitions

```js
router.post('/generate-description', protect, adminOnly, generateItemDescription);
router.post('/review', protect, submitReview);
router.get('/reviews', protect, adminOnly, getReviewStats);
router.get('/recommendations', getRecommendations);
router.post('/chat', protect, handleSupportChat);
```
*   **Why is `/recommendations` public?**: Recommendations are shown on the checkout page which requires login, but the API itself does not need authentication since it only returns menu suggestions (no sensitive data).
*   **Why is `/chat` protected?**: The chatbot reads the user's order data, which is private. Without `protect`, anyone could query another user's order status.

---

### controllers/orderController.js — Automated Status Timer

```js
const startAutomatedProgression = (orderId) => {
  setTimeout(async () => {
    const order = await Order.findById(orderId);
    if (order && order.status === 'pending') {
      order.status = 'accepted';
      order.statusMessage = 'Your order has been accepted by the kitchen!';
      await order.save();

      setTimeout(async () => {
        // ... preparing (3s) -> out_for_delivery (3s) -> delivered (3s)
      }, 3000);
    }
  }, 3000);
};
```
*   **What this does**: After an order is created in `placeOrder`, this function starts a chain of 4 nested `setTimeout` calls, each spaced 3 seconds apart. Each step updates the order's `status` and `statusMessage` in the database.
*   **Safety check before each step**: Before changing status, we re-fetch the order from the database and verify it is still in the expected previous status. If the admin manually cancelled or rejected the order, the check fails and the chain stops gracefully.
*   **Why nested setTimeout instead of setInterval?**: `setInterval` runs indefinitely and requires manual cleanup. Nested `setTimeout` naturally terminates after the final step (delivered), making the code simpler and leak-free.
*   File: `backend/controllers/orderController.js`, Lines 7-69

**Triggered inside `placeOrder` (Line 100)**:
```js
startAutomatedProgression(order._id);
```

---

## FRONTEND FILES — explained

### pages/OrderStatus.jsx — Live Tracking with Toast Notifications

```jsx
const [prevStatus, setPrevStatus] = useState('');

useEffect(() => {
  fetchOrder();
  const interval = setInterval(fetchOrder, 10000);
  return () => clearInterval(interval);
}, [id]);

const fetchOrder = async () => {
  const response = await getOrder(id);
  const newOrder = response.data;
  if (prevStatus && newOrder.status !== prevStatus) {
    toast.success(newOrder.statusMessage || 'Order status updated!');
  }
  setPrevStatus(newOrder.status);
  setOrder(newOrder);
};
```
*   **Polling mechanism**: `setInterval(fetchOrder, 10000)` re-fetches the order from the backend every 10 seconds. When the backend's automated timer updates the status in MongoDB, the next poll picks up the new status.
*   **Toast on status change**: We store the previous status in `prevStatus`. If the newly fetched status differs from the previous one, we fire a `toast.success()` notification showing the restaurant's status message. This gives the user real-time pop-up alerts.
*   **Cleanup**: `return () => clearInterval(interval)` stops polling when the user navigates away, preventing memory leaks.
*   File: `frontend/src/pages/OrderStatus.jsx`, Lines 14, 22-42

**Review Form (Lines 137-171)**:
*   Only rendered when `order.status === 'delivered'`.
*   Star rating selector using 5 clickable buttons.
*   Textarea for review text.
*   Calls `submitReview()` API which triggers AI sentiment analysis on the backend.
*   File: `frontend/src/pages/OrderStatus.jsx`, Lines 137-171

---

### pages/Checkout.jsx — Smart Recommendations Panel

*   When the checkout page loads, it extracts the unique categories from the cart items and calls `GET /api/ai/recommendations?categories=pizza,sides`.
*   Displays a purple-themed "You might also like" section at the top with 3 recommended items from a complementary category.
*   File: `frontend/src/pages/Checkout.jsx`, Lines 23-41 (API call), Lines 62-79 (UI rendering)

---

### pages/admin/ManageMenu.jsx — AI Generate Button

*   Added a purple "AI Generate" button next to the description input field.
*   When clicked, it calls `POST /api/ai/generate-description` with the item name and category.
*   The returned AI-generated description is populated into the description textarea automatically.
*   File: `frontend/src/pages/admin/ManageMenu.jsx`, Lines 46-59 (handler), Lines 88-93 (button UI)

---

### pages/admin/AdminDashboard.jsx — Sentiment Analytics Widget

*   Fetches review stats from `GET /api/ai/reviews` on page load.
*   Displays an "AI Sentiment Analytics" card showing: total reviews, positive/neutral/negative counts, and average star rating.
*   File: `frontend/src/pages/admin/AdminDashboard.jsx`, Lines 6-9 (state), Lines 21-27 (API call), Lines 45-77 (UI)

---

### components/SupportChat.jsx — Floating AI Chatbot

*   **Bubble button**: A fixed-position red circular button at the bottom-right corner. Clicking it toggles the chat window open/closed.
*   **Chat window**: A 320x420px dark-themed panel with a red header, scrollable message area, and an input form.
*   **Message flow**: User types a message, it is added to the local `messages` state array and displayed in a purple bubble. The message is sent to `POST /api/ai/chat`. The AI reply is added as a grey bubble.
*   **Loading state**: While waiting for the API response, an "AI is typing..." indicator appears.
*   **Auth check**: If the user is not logged in, the chatbot replies locally: "Please log in to track your orders."
*   File: `frontend/src/components/SupportChat.jsx`, Lines 1-236
*   Mounted globally in: `frontend/src/App.jsx`, Line 70

---

## API SERVICE UPDATE — frontend/src/services/api.js

Added two new API wrapper functions:
```js
export const submitReview = (data) => API.post('/ai/review', data);         // Line 97
export const getReviewStats = () => API.get('/ai/reviews');                  // Line 98
export const getRecommendations = (categories) => API.get(`/ai/recommendations?categories=${categories}`);  // Line 99
export const sendChatMessage = (message) => API.post('/ai/chat', { message });  // Line 100
```

---

## WHAT'S DONE vs WHAT'S LEFT

| Feature | Status | Where it lives |
| :--- | :--- | :--- |
| **AI Description Generator** | Done | Backend: `aiService.js`, `aiController.js` (L9-23). Frontend: `ManageMenu.jsx` (L46-93). |
| **AI Sentiment Analysis** | Done | Backend: `aiService.js`, `aiController.js` (L26-108), `Review.js`. Frontend: `OrderStatus.jsx` (L137-171), `AdminDashboard.jsx` (L45-77). |
| **Smart Recommendations** | Done | Backend: `aiController.js` (L111-143). Frontend: `Checkout.jsx` (L23-79). |
| **Automated Order Timer** | Done | Backend: `orderController.js` (L7-69, L100). |
| **AI Support Chatbot** | Done | Backend: `aiController.js` (L145-240), `aiRoutes.js`. Frontend: `SupportChat.jsx`, `App.jsx` (L70). |
| **Hybrid Fallback Mode** | Done | Backend: `aiService.js` (all 3 functions have try-catch with local fallbacks). |
| **Automated Email Notifications** | Planned | Will use Nodemailer to send emails on order placed and delivered. |

---

## QUESTIONS A TEACHER WOULD ASK (AND HOW TO ANSWER)

### On AI Integration
**Q: Why did you use Gemini's REST API instead of the official Google SDK?**
A: The official `@google/generative-ai` SDK adds around 50+ transitive dependencies to our project. Since we only need to send a text prompt and get a text response, a single axios POST request achieves the same result with zero extra dependencies. It is also easier to understand — it is just an HTTP call.

**Q: What happens if the AI API key runs out of credits during a demo?**
A: We built a Hybrid Fallback system. Every AI function (description generator, sentiment analyzer, support chatbot) is wrapped in a try-catch. If the Gemini API returns a 429 (Resource Exhausted) or any error, the catch block runs a local fallback that uses template strings or keyword matching to generate an accurate response. The website never crashes.

**Q: How does the sentiment analysis fallback work without AI?**
A: It uses lexicon-based sentiment analysis. We define two arrays: one with positive words (good, great, delicious, love, best, awesome, excellent, tasty, amazing, yummy) and one with negative words (bad, slow, cold, worst, burnt, hate, terrible, poor, expensive, late). We scan the review text for matches and calculate a score. If the score is positive, the sentiment is positive. If negative, it is negative. Otherwise, neutral.

---

### On the Automated Timer
**Q: Why use nested setTimeout instead of setInterval for order progression?**
A: setInterval fires repeatedly until manually stopped, which risks continuing to run even after the order reaches "delivered." Nested setTimeout calls naturally terminate after the last step. Each inner setTimeout only starts after the previous step completes successfully, making the chain self-terminating.

**Q: What happens if the admin cancels an order while the timer is running?**
A: Before each transition, we re-read the order from the database using `Order.findById(orderId)`. If the status does not match the expected previous state (e.g., we expect "accepted" but the admin set it to "cancelled"), the if-condition fails and the chain stops. No further updates happen.

---

### On the Support Chatbot
**Q: How does the chatbot know the customer's order status?**
A: Inside `handleSupportChat`, we query the database for the user's most recent order using `Order.findOne({ user: req.user._id }).sort({ createdAt: -1 })`. We extract the order's status, items, total amount, and delivery mode, and include all of this in the prompt sent to Gemini. The AI then answers the customer's question using this real-time context.

**Q: Is the chatbot available to users who are not logged in?**
A: The backend route `/api/ai/chat` is protected by the `protect` middleware, which requires a valid JWT token. On the frontend, if `isAuthenticated` is false, the chatbot replies locally with "Please log in to track your orders" without making any API call.
