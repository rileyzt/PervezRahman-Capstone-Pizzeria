// SUPPORT CHATBOT COMPONENT - Floating AI support chat bubble
// Beginner-friendly React state and Axios API call to backend

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../services/api';

const SupportChat = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I am your Pizzeria AI Assistant. How can I help you today?", isBot: true }
  ]);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat when a new message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle message submit
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 1. Add user's message to chat list
    const userMessage = inputText;
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInputText('');

    // 2. If user is not logged in, ask them to login
    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { text: "Please log in to track your orders or get personalized support.", isBot: true }
      ]);
      return;
    }

    // 3. Make simple backend API call to get AI response
    setLoading(true);
    try {
      const response = await sendChatMessage(userMessage);
      const botReply = response.data.reply;
      
      // 4. Add AI reply to chat list
      setMessages((prev) => [...prev, { text: botReply, isBot: true }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { text: "Oops, my pizza logic is bubbling! Please try again in a moment.", isBot: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
  
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#E50914',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="AI Pizza Support"
        >
          💬 {/*emoji for design only */}
        </button>
      )}

  
      {isOpen && (
        <div
          style={{
            width: '320px',
            height: '420px',
            backgroundColor: '#141414',
            border: '1px solid #2d2d2d',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
      
          <div
            style={{
              backgroundColor: '#E50914',
              color: 'white',
              padding: '12px 15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
            }}
          >
            <span>🍕 Pizzeria AI Support</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

      
          <div
            style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.isBot ? 'flex-start' : 'flex-end',
                  backgroundColor: msg.isBot ? '#2c2c2c' : '#7928CA',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  maxWidth: '80%',
                  fontSize: '0.9rem',
                  lineHeight: '1.3',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                }}
              >
                {msg.text}
              </div>
            ))}

   
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#2c2c2c',
                  color: '#aaa',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontStyle: 'italic',
                }}
              >
                AI is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

        
          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              borderTop: '1px solid #2d2d2d',
              padding: '10px',
              backgroundColor: '#0a0a0a',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                backgroundColor: '#1c1c1c',
                border: '1px solid #2d2d2d',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                marginLeft: '8px',
                backgroundColor: '#E50914',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
