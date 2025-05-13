'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Package, ShoppingBag, Tag, Settings, Store } from 'lucide-react';

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

                    <div className="bg-white rounded-lg shadow p-6 mb-8">
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

                    {/* Dashboard Navigation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link href="/seller/manage-products">
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">Products</h3>
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Tag className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">Manage your product listings</p>
                            </div>
                        </Link>

                        <Link href="/seller/orders">
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">Orders</h3>
                                    <div className="bg-purple-100 p-2 rounded-full">
                                        <ShoppingBag className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">View and manage all orders</p>
                            </div>
                        </Link>

                        <Link href="/seller/product-orders">
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">Product Orders</h3>
                                    <div className="bg-green-100 p-2 rounded-full">
                                        <Package className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">View orders by product</p>
                            </div>
                        </Link>

                        <Link href="/seller/shop-profile">
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg">Shop Profile</h3>
                                    <div className="bg-amber-100 p-2 rounded-full">
                                        <Store className="h-5 w-5 text-amber-600" />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">Update your shop details</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 