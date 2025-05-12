'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

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
                const userId = localStorage.getItem('userId');
                
                console.log('Auth init - stored data:', { 
                    hasToken: !!token, 
                    hasUserRole: !!userRole,
                    hasStoredUser: !!storedUser,
                    hasUserId: !!userId
                });
                
                if (token) {
                    // Set default authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    if (storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            
                            // Ensure user object has an ID
                            if (!parsedUser._id && !parsedUser.id && userId) {
                                parsedUser._id = userId;
                            }
                            
                            console.log('Setting user from localStorage:', { 
                                hasId: !!parsedUser.id,
                                hasUnderscoreId: !!parsedUser._id,
                                allUserProps: Object.keys(parsedUser)
                            });
                            
                            setUser(parsedUser);
                        } catch (parseError) {
                            console.error('Error parsing stored user:', parseError);
                            logout();
                        }
                    } else if (userId) {
                        // If we have a userId but no user object, create a minimal user object
                        console.log('Creating minimal user object with ID:', userId);
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

            const { token, user: userData, seller, email, role: userRole, id, _id } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }

            // Extract the user ID from the response
            const userId = _id || id || (userData && (userData._id || userData.id)) || 
                          (seller && (seller._id || seller.id));
                          
            if (!userId) {
                console.warn('No user ID found in login response:', response.data);
            } else {
                // Store userId separately for redundancy
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
            
            // Ensure user object has an ID
            if (!userInfo._id && !userInfo.id && userId) {
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