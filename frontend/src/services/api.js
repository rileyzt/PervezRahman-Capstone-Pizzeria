// API SERVICE - Axios HTTP Client for Backend Communication
// PDF: "Integrate HTTP client module to communicate with the backend APIs"

// THIS FILE DOES:
// 1. Creates an Axios instance with base URL pointing to our backend
// 2. Adds an interceptor to automatically attach JWT token to every request
// 3. Exports helper functions for each API endpoint


import axios from 'axios';
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH API CALLS
// PDF: "CRUD on User and Admin (login, logout, register)"

export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getProfile = () => API.get('/auth/profile');
// MENU API CALLS
// PDF: "CRUD on the items available in the menu" + "see the different categories"
export const getMenuItems = (category) => {
  const query = category ? `?category=${category}` : '';
  return API.get(`/menu${query}`);
};
export const getMenuItem = (id) => API.get(`/menu/${id}`);
export const searchMenu = (query) => API.get(`/menu/search?q=${query}`);
export const createMenuItem = (itemData) => API.post('/menu', itemData);
export const updateMenuItem = (id, itemData) => API.put(`/menu/${id}`, itemData);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// ORDER API CALLS
// PDF: "place / cancel the order" + "accept or reject the order"
export const placeOrder = (orderData) => API.post('/orders', orderData);
export const getMyOrders = () => API.get('/orders/my');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
export const getAllOrders = () => API.get('/orders');
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);
// PAYMENT API CALLS
// PDF: "bill amount for the order along with payment options"
export const processPayment = (paymentData) => API.post('/payment/process', paymentData);
export const getPaymentStatus = (orderId) => API.get(`/payment/status/${orderId}`);
// ADMIN API CALLS
// PDF: "monthly revenue" + "generate the bill"
export const getMonthlyRevenue = () => API.get('/admin/revenue');
export const generateBill = (orderId) => API.get(`/admin/bill/${orderId}`);
export const getDashboardStats = () => API.get('/admin/stats');

// AI API CALLS 
export const aiGenerateDescription = (data) => API.post('/ai/generate-description', data);
export const submitReview = (data) => API.post('/ai/review', data);
export const getReviewStats = () => API.get('/ai/reviews');
export const getRecommendations = (categories) => API.get(`/ai/recommendations?categories=${categories}`);
export const sendChatMessage = (message) => API.post('/ai/chat', { message });
export const getSmartRecommendations = (query) => API.post('/ai/smart-recommend', { query });

export default API;
