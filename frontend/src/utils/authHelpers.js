/**
 * Utility functions for authentication and user management
 * These functions provide a consistent way to handle user data across the application
 */

/**
 * Get the user ID from multiple possible sources
 * @returns {string|null} The user ID or null if not found
 */
export const getUserId = () => {
  try {
    // First try from localStorage user object
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const id = parsedUser._id || parsedUser.id;
      if (id) return id;
    }
    
    // Try dedicated userId in localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) return storedUserId;
    
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Save user ID to localStorage
 * @param {string} userId - The user ID to save
 */
export const saveUserId = (userId) => {
  if (!userId) return;
  localStorage.setItem('userId', userId);
  
  // Also update the user object if it exists
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser._id && !parsedUser.id) {
        parsedUser._id = userId;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
    }
  } catch (error) {
    console.error('Error updating user object with ID:', error);
  }
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isUserAuthenticated = () => {
  const token = localStorage.getItem('token');
  const hasUserId = !!getUserId();
  
  return !!token && hasUserId;
};

/**
 * Extract user ID from API response
 * @param {Object} data - API response data
 * @returns {string|null} The user ID or null if not found
 */
export const extractUserIdFromResponse = (data) => {
  if (!data) return null;
  
  // Try all common variants of where an ID might be stored
  return data._id || 
         data.id || 
         data.userId || 
         data.user_id ||
         (data.user && (data.user._id || data.user.id)) ||
         (data.userData && (data.userData._id || data.userData.id)) ||
         (data.seller && (data.seller._id || data.seller.id));
};

/**
 * Save authentication data consistently
 * @param {Object} data - Authentication data including token and user info
 */
export const saveAuthData = (data) => {
  if (!data) return;
  
  // Save token
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  
  // Extract and save user ID
  const userId = extractUserIdFromResponse(data);
  if (userId) {
    saveUserId(userId);
  }
  
  // Save user data
  const userData = data.user || data.userData || data.seller || data;
  if (userData && typeof userData === 'object') {
    // Ensure the user object has an ID
    if (userId && !userData._id && !userData.id) {
      userData._id = userId;
    }
    
    localStorage.setItem('user', JSON.stringify(userData));
  }
  
  // Save role if present
  if (data.role) {
    localStorage.setItem('userRole', data.role);
  }
}; 