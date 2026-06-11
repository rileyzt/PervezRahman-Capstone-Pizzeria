// AI SERVICE — calls Gemini API using simple axios POST request
// One API key handles all 3 features:
//   1. Description generator (for admin menu)
//   2. Sentiment analysis (for customer reviews)

const axios = require('axios');

// call Gemini API with a simple prompt
const askGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;

  // simple request body - just a text prompt
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await axios.post(url, body);

  // extract the text from Gemini's response
  const text = response.data.candidates[0].content.parts[0].text;
  return text.trim();
};

// generate a menu item description
const generateDescription = async (itemName, category) => {
  try {
    const prompt = 'Write a short 1-line mouthwatering food description (max 15 words) for a menu item named "' + itemName + '" in the category "' + category + '". Only return the description, nothing else.';
    const description = await askGemini(prompt);
    return description;
  } catch (error) {
    console.log('Gemini API depleted or failed, using local description fallback');
    // Simple beginner-friendly fallback description
    return `A delicious, freshly prepared ${itemName} made with premium ingredients in our traditional stone oven.`;
  }
};

// analyze sentiment of a customer review
const analyzeSentiment = async (reviewText) => {
  try {
    const prompt = 'Analyze the sentiment of this customer review and reply with exactly one word: positive, neutral, or negative. Review: "' + reviewText + '"';
    const sentiment = await askGemini(prompt);
    // clean the response - make lowercase, remove extra spaces
    return sentiment.toLowerCase().replace(/[^a-z]/g, '');
  } catch (error) {
    console.log('Gemini API depleted or failed, using local sentiment analysis fallback');
    // Simple word-matching fallback
    const text = reviewText.toLowerCase();
    const positiveWords = ['good', 'great', 'delicious', 'love', 'best', 'nice', 'awesome', 'excellent', 'tasty', 'amazing', 'yummy'];
    const negativeWords = ['bad', 'slow', 'cold', 'worst', 'burnt', 'hate', 'terrible', 'disgusting', 'poor', 'expensive', 'late'];

    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score++;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score--;
    });

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }
};

module.exports = { askGemini, generateDescription, analyzeSentiment };
