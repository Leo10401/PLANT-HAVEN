'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isSeller, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!isAuthenticated() || !isSeller())) {
            router.push('/identify');
        }
    }, [loading, isAuthenticated, isSeller, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated() || !isSeller()) {
        return null;
    }

    return children;
} 
