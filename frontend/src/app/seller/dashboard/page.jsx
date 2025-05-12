'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";

export default function SellerDashboard() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
                        <Button onClick={logout} variant="outline">
                            Logout
                        </Button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <p className="text-gray-600">Shop Name</p>
                                <p className="font-medium">{user?.shopName}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600">Email</p>
                                <p className="font-medium">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 