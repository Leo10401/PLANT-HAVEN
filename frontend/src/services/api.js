import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Product API calls
export const getProduct = async (id) => {
  try {
    const response = await api.get(`/prod/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error.response?.data || error.message);
    throw error;
  }
};

export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error.response?.data || error.message);
    throw error;
  }
};

export const addToCart = async (productId, quantity) => {
  try {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error.response?.data || error.message);
    throw error;
  }
};

export const markReviewHelpful = async (reviewId) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  } catch (error) {
    console.error('Error marking review helpful:', error.response?.data || error.message);
    throw error;
  }
};

export const addReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/reviews`, {
      ...reviewData,
      product: productId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding review:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserShipping = async (userId, shippingData) => {
  try {
    const response = await api.put(`/user/update/${userId}`, {
      shipping: shippingData.shipping,
      paymentMethod: shippingData.paymentMethod
    });
    return response.data;
  } catch (error) {
    console.error('Error updating shipping info:', error.response?.data || error.message);
    throw error;
  }
}; 