'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

// Helper function to decode JWT token
const decodeToken = (token) => {
    try {
        // Extract payload part of the token (middle part)
        const base64Payload = token.split('.')[1];
        // Decode and parse the payload
        const payload = JSON.parse(atob(base64Payload));
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Helper function to extract user ID from token or fallback methods
const extractUserIdFromToken = (token) => {
    if (!token) return null;
    
    const decodedToken = decodeToken(token);
    return decodedToken?._id || null;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Create axios instance with base URL
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userRole = localStorage.getItem('userRole');
                const storedUser = localStorage.getItem('user');
                
                console.log('Auth init - stored data:', { 
                    hasToken: !!token, 
                    hasUserRole: !!userRole,
                    hasStoredUser: !!storedUser
                });
                
                if (token) {
                    // Set default authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Try to extract user ID from token
                    const userId = extractUserIdFromToken(token);
                    
                    if (userId) {
                        // Store userId for redundancy
                        localStorage.setItem('userId', userId);
                    }
                    
                    if (storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            
                            // Ensure user object has an ID - use token payload if needed
                            if (!parsedUser._id && !parsedUser.id && userId) {
                                parsedUser._id = userId;
                            }
                            
                            console.log('Setting user from localStorage:', { 
                                hasId: !!parsedUser.id,
                                hasUnderscoreId: !!parsedUser._id,
                                userId,
                                allUserProps: Object.keys(parsedUser)
                            });
                            
                            setUser(parsedUser);
                        } catch (parseError) {
                            console.error('Error parsing stored user:', parseError);
                            
                            // If we can't parse the user object but have a token with ID,
                            // create a minimal user object with the ID from token
                            if (userId) {
                                const minimalUser = { _id: userId };
                                setUser(minimalUser);
                                localStorage.setItem('user', JSON.stringify(minimalUser));
                            } else {
                                logout();
                            }
                        }
                    } else if (userId) {
                        // If we have a userId from token but no user object, create a minimal user object
                        console.log('Creating minimal user object with ID from token:', userId);
                        const minimalUser = { _id: userId };
                        setUser(minimalUser);
                        localStorage.setItem('user', JSON.stringify(minimalUser));
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials, role) => {
        try {
            const endpoint = role === 'seller' ? '/seller/login' : '/user/authenticate';
            const response = await api.post(endpoint, credentials);
            
            if (!response.data) {
                throw new Error('No data received from server');
            }

            const { token, user: userData, seller, email, role: userRole, _id } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }

            // Get user ID from response first, then fall back to token payload
            let userId = _id;
            
            // If userId not in response, try to extract from token
            if (!userId) {
                userId = extractUserIdFromToken(token);
                console.log('User ID extracted from token:', userId);
            } else {
                console.log('User ID found in response:', userId);
            }
            
            if (!userId) {
                console.warn('No user ID found in response or token payload');
            } else {
                // Store userId
                localStorage.setItem('userId', userId);
            }

            // Store token and role in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('selectedRole', role);
            
            // Set cookies for middleware
            document.cookie = `token=${token}; path=/`;
            document.cookie = `userRole=${role}; path=/`;
            document.cookie = `selectedRole=${role}; path=/`;
            
            // Set authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Prepare user data based on role
            let userInfo;
            if (role === 'seller') {
                userInfo = seller || {};
            } else {
                userInfo = userData || { email, role: userRole };
            }
            
            // Add ID to user info if not present
            if (!userInfo._id && userId) {
                userInfo._id = userId;
            }
            
            console.log('Login successful, user info:', { 
                hasId: !!userInfo.id,
                hasUnderscoreId: !!userInfo._id,
                userId,
                allUserProps: Object.keys(userInfo)
            });
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);
            
            return { success: true, user: userInfo };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('selectedRole');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        delete api.defaults.headers.common['Authorization'];
        router.push('/');
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const isSeller = () => {
        const selectedRole = localStorage.getItem('selectedRole');
        return selectedRole === 'seller';
    };
    
    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    const updateUserProfile = async (data) => {
        try {
            // Get user ID with multiple fallbacks
            const userId = user?._id || user?.id || localStorage.getItem('userId');
            
            if (!userId) {
                console.error('User ID not found in updateUserProfile:', { user });
                throw new Error('User ID not found');
            }

            const endpoint = isSeller() ? `/seller/update/${userId}` : `/user/update/${userId}`;
            const response = await api.put(endpoint, data);
            
            const updatedUser = response.data;
            
            // Ensure updated user has the ID (some APIs don't return it in updates)
            if (!updatedUser._id && !updatedUser.id) {
                updatedUser._id = userId;
            }
            
            // Update both localStorage and state
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Update profile error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Update failed' 
            };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated,
            isSeller,
            isAdmin,
            updateUserProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 
