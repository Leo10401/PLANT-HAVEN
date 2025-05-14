"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

// Helper function to decode JWT token
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart items on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Skip fetching cart if no token exists (user not logged in)
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      // Decode token to verify if it's valid and has user ID
      const decoded = decodeToken(token);
      if (!decoded || !decoded._id) {
        console.log('Invalid token or missing user ID in token payload');
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const response = await axios.get('http://localhost:5000/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCartItems(response.data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCartItems([]);
      
      if (err.response?.status === 403) {
        setError('Authentication error. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to add items to cart');
        return false;
      }
      
      // Verify token has valid user ID
      const decoded = decodeToken(token);
      if (!decoded || !decoded._id) {
        setError('Authentication error. Please log in again.');
        return false;
      }
      
      const response = await axios.post('http://localhost:5000/cart/items', 
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setCartItems(response.data.items);
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to update cart');
        return false;
      }
      
      // Verify token has valid user ID
      const decoded = decodeToken(token);
      if (!decoded || !decoded._id) {
        setError('Authentication error. Please log in again.');
        return false;
      }
      
      const response = await axios.put(`http://localhost:5000/cart/items/${productId}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setCartItems(response.data.items);
      return true;
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.response?.data?.message || 'Failed to update quantity');
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to remove items from cart');
        return false;
      }
      
      // Verify token has valid user ID
      const decoded = decodeToken(token);
      if (!decoded || !decoded._id) {
        setError('Authentication error. Please log in again.');
        return false;
      }
      
      const response = await axios.delete(`http://localhost:5000/cart/items/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCartItems(response.data.items);
      return true;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.response?.data?.message || 'Failed to remove item');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to clear cart');
        return false;
      }
      
      // Verify token has valid user ID
      const decoded = decodeToken(token);
      if (!decoded || !decoded._id) {
        setError('Authentication error. Please log in again.');
        return false;
      }
      
      await axios.delete('http://localhost:5000/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCartItems([]);
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.response?.data?.message || 'Failed to clear cart');
      return false;
    }
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 
