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
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            const storedUser = localStorage.getItem('user');
            
            if (token && userRole && storedUser) {
                try {
                    // Set default authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error initializing auth:', error);
                    logout();
                }
            }
            setLoading(false);
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

            const { token, seller, email, role: userRole } = response.data;
            
            if (!token) {
                throw new Error('No token received from server');
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
                userInfo = seller;
            } else {
                userInfo = { email, role: userRole };
            }
            
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
        delete api.defaults.headers.common['Authorization'];
        router.push('/identify');
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
            const userId = user?.id || user?._id;
            if (!userId) {
                throw new Error('User ID not found');
            }

            const endpoint = isSeller() ? `/seller/update/${userId}` : `/user/update/${userId}`;
            const response = await api.put(endpoint, data);
            
            const updatedUser = response.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            return { success: true };
        } catch (error) {
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