// AI CONTROLLER — handles AI-powered features

const { askGemini, generateDescription, analyzeSentiment } = require('../services/aiService');
const Review = require('../models/Review');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// POST /api/ai/generate-description — admin generates a menu item description
const generateItemDescription = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide item name' });
    }

    const description = await generateDescription(name, category || 'food');
    res.json({ description });
  } catch (error) {
    console.log('AI Error:', error.message);
    res.status(500).json({ message: 'AI generation failed. Check your API key.', error: error.message });
  }
};

// POST /api/ai/review — customer submits a review for a delivered order
const submitReview = async (req, res) => {
  try {
    const { orderId, reviewText, rating } = req.body;

    if (!orderId || !reviewText || !rating) {
      return res.status(400).json({ message: 'Please provide orderId, reviewText, and rating' });
    }

    // check if order exists and is delivered
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'You can only review delivered orders' });
    }

    // check if already reviewed
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }

    // use AI to analyze sentiment
    let sentiment = 'neutral';
    try {
      sentiment = await analyzeSentiment(reviewText);
      // make sure it's one of the valid values
      if (!['positive', 'neutral', 'negative'].includes(sentiment)) {
        sentiment = 'neutral';
      }
    } catch (aiError) {
      console.log('Sentiment analysis failed, defaulting to neutral:', aiError.message);
    }

    const review = await Review.create({
      order: orderId,
      user: req.user._id,
      reviewText,
      rating,
      sentiment
    });

    res.status(201).json({
      message: 'Review submitted! Sentiment: ' + sentiment,
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/ai/reviews — admin gets all reviews with sentiment stats
const getReviewStats = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('order', '_id totalAmount')
      .sort({ createdAt: -1 });

    // count sentiments
    let positive = 0, neutral = 0, negative = 0, totalRating = 0;
    for (let i = 0; i < reviews.length; i++) {
      if (reviews[i].sentiment === 'positive') positive++;
      if (reviews[i].sentiment === 'neutral') neutral++;
      if (reviews[i].sentiment === 'negative') negative++;
      totalRating = totalRating + reviews[i].rating;
    }

    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      totalReviews: reviews.length,
      positive,
      neutral,
      negative,
      avgRating,
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/ai/recommendations — simple rule-based recommendations
const getRecommendations = async (req, res) => {
  try {
    const { categories } = req.query;
    // categories is a comma-separated string like "pizza,sides"

    const cartCategories = categories ? categories.split(',') : [];
    let recommendCategory = '';

    // simple rules
    if (cartCategories.includes('pizza') && !cartCategories.includes('beverages')) {
      recommendCategory = 'beverages';
    } else if (cartCategories.includes('pizza') && !cartCategories.includes('sides')) {
      recommendCategory = 'sides';
    } else if (cartCategories.includes('sides') && !cartCategories.includes('pizza')) {
      recommendCategory = 'pizza';
    } else if (cartCategories.includes('beverages') && !cartCategories.includes('pizza')) {
      recommendCategory = 'pizza';
    } else {
      recommendCategory = 'bestsellers';
    }

    // get 3 items from the recommended category
    const items = await MenuItem.find({ category: recommendCategory, isAvailable: true }).limit(3);

    res.json({
      message: 'You might also like these!',
      category: recommendCategory,
      items
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// POST /api/ai/chat — customer chats with support AI agent
const handleSupportChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Please enter a message' });
    }

    // find user's latest order
    const latestOrder = await Order.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    let prompt = '';
    if (latestOrder) {
      // format items string for context
      const itemsList = latestOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
      
      prompt = `You are "Pizzeria AI Support", a friendly customer support agent. 
Here is the customer's current order info:
- Order ID: ${latestOrder._id}
- Items: ${itemsList}
- Total Amount: ₹${latestOrder.totalAmount}
- Current Status: ${latestOrder.status}
- Status Message: "${latestOrder.statusMessage || 'No updates yet'}"
- Delivery Mode: ${latestOrder.deliveryMode}

The customer says: "${message}"

Answer their question politely in a friendly, conversational way using this order context. Be extremely brief (max 30 words). If they ask where their order is, explain the status and message clearly.`;
    } else {
      prompt = `You are "Pizzeria AI Support", a friendly customer support agent.
The customer has not placed any orders yet.

The customer says: "${message}"

Answer their question politely in a friendly, conversational way. Be extremely brief (max 30 words).`;
    }

    try {
      const reply = await askGemini(prompt);
      res.json({ reply });
    } catch (aiError) {
      console.log('Gemini API depleted or failed, using local chatbot fallback');
      
      // Local chatbot logic (beginner-friendly word-matching and state checks)
      const text = message.toLowerCase();
      let reply = '';

      if (latestOrder) {
        const status = latestOrder.status;
        const itemsList = latestOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

        if (text.includes('order') || text.includes('where') || text.includes('track') || text.includes('status')) {
          if (status === 'pending') {
            reply = `Your order for ${itemsList} is currently pending kitchen acceptance. We will start preparing it soon!`;
          } else if (status === 'accepted') {
            reply = `Great news! Your order for ${itemsList} has been accepted by the kitchen and will start prep shortly.`;
          } else if (status === 'preparing') {
            reply = `Our chef is preparing your delicacies! It will be ready to go soon.`;
          } else if (status === 'out_for_delivery') {
            reply = `Your order is out for delivery! The rider is on the way to your address.`;
          } else if (status === 'delivered') {
            reply = `Your order has been delivered! Enjoy your meal! Please rate us on the tracking page.`;
          } else {
            reply = `Your order is currently in ${status} stage. Message: "${latestOrder.statusMessage || 'No updates yet'}"`;
          }
        }
      }

      // If no order match or generic question keywords
      if (!reply) {
        if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
          reply = 'Hello! I am your Pizzeria AI Assistant. How can I help you today?';
        } else if (text.includes('recommend') || text.includes('pizza') || text.includes('suggest')) {
          reply = 'I highly recommend trying our bestseller: the Italian Margherita Pizza or the Garlic Breadsticks!';
        } else if (text.includes('price') || text.includes('cost') || text.includes('menu')) {
          reply = 'Please check our Menu tab to see all our mouthwatering pizzas and their prices!';
        } else if (text.includes('thank') || text.includes('thanks')) {
          reply = "You're very welcome! Enjoy your fresh pizza!";
        } else {
          // generic default reply
          if (latestOrder) {
            reply = `I am here to help. Currently, your latest order status is: ${latestOrder.status}.`;
          } else {
            reply = 'Hello! I can help you recommend pizzas or track your order status once you place an order.';
          }
        }
      }

      res.json({ reply });
    }
  } catch (error) {
    res.status(500).json({ message: 'AI failed to reply. Check your API key.', error: error.message });
  }
};

// POST /api/ai/smart-recommend — AI recommends menu items based on customer's mood/preference
const handleSmartRecommend = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Please describe what you are in the mood for' });
    }

    // Fetch all available menu items from database
    const allItems = await MenuItem.find({ isAvailable: true });
    if (allItems.length === 0) {
      return res.json({ items: [], message: 'No menu items available right now' });
    }

    // Build a short list of items for the AI prompt
    const itemList = allItems.map(item => `${item.name} (${item.category}, INR ${item.price})`).join(', ');

    try {
      // Ask Gemini to pick the best matching item names
      const prompt = `You are a menu recommendation assistant for a pizza restaurant.
Here are all available items: ${itemList}

The customer says: "${query}"

Return ONLY the exact names of the top 3 most relevant items, separated by commas. Nothing else. No explanation. Just names.`;

      const aiResponse = await askGemini(prompt);

      // Parse AI response — extract item names and match them to database items
      const recommendedNames = aiResponse.split(',').map(n => n.trim().toLowerCase());
      const matched = allItems.filter(item =>
        recommendedNames.some(name => item.name.toLowerCase().includes(name) || name.includes(item.name.toLowerCase()))
      );

      if (matched.length > 0) {
        return res.json({ items: matched.slice(0, 4), message: 'Here are our AI picks for you' });
      }
    } catch (aiError) {
      console.log('Gemini API failed for recommendation, using keyword fallback');
    }

    // FALLBACK — simple keyword matching against item name, description, and category
    const words = query.toLowerCase().split(' ');
    const scored = allItems.map(item => {
      let score = 0;
      const text = (item.name + ' ' + item.description + ' ' + item.category).toLowerCase();
      for (let i = 0; i < words.length; i++) {
        if (text.includes(words[i])) score++;
      }
      return { item, score };
    });

    // Sort by score (highest first) and pick top 4
    scored.sort((a, b) => b.score - a.score);
    const topItems = scored.filter(s => s.score > 0).slice(0, 4).map(s => s.item);

    // If no keyword matched at all, return random 3 items
    if (topItems.length === 0) {
      const shuffled = allItems.sort(() => 0.5 - Math.random());
      return res.json({ items: shuffled.slice(0, 3), message: 'Here are some popular picks for you' });
    }

    res.json({ items: topItems, message: 'Here are our picks for you' });
  } catch (error) {
    res.status(500).json({ message: 'Recommendation failed', error: error.message });
  }
};

module.exports = { 
  generateItemDescription, 
  submitReview, 
  getReviewStats, 
  getRecommendations, 
  handleSupportChat,
  handleSmartRecommend
};
