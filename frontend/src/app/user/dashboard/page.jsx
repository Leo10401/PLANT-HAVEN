"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Leaf,
  ChevronRight,
  Package,
  User,
  Home,
  Heart,
  CreditCard,
  LogOut,
  ShoppingBag,
  Calendar,
  Clock,
  Settings,
  Truck,
  CheckCircle,
  XCircle,
  Bell,
  Edit,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CartIcon } from '@/components/ui/CartIcon';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      toast.error('Please login to view your dashboard');
      router.push('/identify');
      return;
    }

    fetchOrders();
    // We would fetch wishlist items here in a real app
    // fetchWishlistItems(); 
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      // Get token and user ID
      const token = localStorage.getItem('token');
      let userId = user?._id || localStorage.getItem('userId');
      
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        router.push('/identify');
        return;
      }

      if (!userId) {
        toast.error('User ID not found. Please log in again.');
        router.push('/identify');
        return;
      }

      // Ensure token is properly formatted
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const apiUrl = `http://localhost:5000/orders/user/${userId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });

      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data.orders)) {
          // Sort orders by date (newest first)
          const sortedOrders = data.orders.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          setOrders(sortedOrders);
          
          // Calculate statistics
          const pending = sortedOrders.filter(order => 
            ['pending', 'processing', 'shipped'].includes(order.status)
          ).length;
          
          const delivered = sortedOrders.filter(order => 
            order.status === 'delivered'
          ).length;
          
          setStats({
            totalOrders: sortedOrders.length,
            pendingOrders: pending,
            deliveredOrders: delivered
          });
        } else {
          toast.error('Invalid data format received from server');
        }
      } else {
        toast.error(data.message || 'Failed to load orders');
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          router.push('/identify');
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-green-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
              <img src="/qkartlogo.png" alt="" height={64} width={40} />
            </div>
            <div className="flex flex-col">

                <span className="text-lg sm:text-4xl font-bold text-green-600">Qkart</span>
                <span className="text-[10px]">Tiny Hands, Green Lands</span>
              </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/user/all-orders" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              My Orders
            </Link>
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <CartIcon />
            <div className="relative h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name || "User"} />
                <AvatarFallback className="bg-green-100 text-green-600">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-green-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium">Dashboard</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar - 3 columns on larger screens */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              {/* User Info */}
              <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-gray-100">
                <div className="relative mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-green-100 text-green-600 text-xl">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-green-100 p-1 rounded-full">
                    <Edit className="h-3 w-3 text-green-600" />
                  </button>
                </div>
                <h2 className="font-bold text-lg mb-1">{user?.name || "User"}</h2>
                <p className="text-gray-500 text-sm">{user?.email || ""}</p>
              </div>
              
              {/* Navigation */}
              <nav className="space-y-1 mb-6">
                <Link href="/user/dashboard" className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/user/all-orders" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Package className="h-5 w-5" />
                  <span>My Orders</span>
                </Link>
                <Link href="/user/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <User className="h-5 w-5" />
                  <span>Profile Settings</span>
                </Link>
              </nav>
              
              {/* Logout Button */}
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          {/* Main Content - 9 columns on larger screens */}
          <div className="md:col-span-9">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">My Dashboard</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{stats.totalOrders}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/user/all-orders" className="text-xs text-green-600 hover:text-green-700 flex items-center">
                    View All Orders
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{stats.pendingOrders}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/user/all-orders?filter=pending" className="text-xs text-yellow-600 hover:text-yellow-700 flex items-center">
                    View Pending
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Delivered Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{stats.deliveredOrders}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link href="/user/all-orders?filter=delivered" className="text-xs text-green-600 hover:text-green-700 flex items-center">
                    View Delivered
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </CardFooter>
              </Card>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Link href="/user/all-orders" className="text-sm text-green-600 hover:text-green-700 flex items-center">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <ShoppingBag className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                  <Button 
                    onClick={() => router.push('/Browse-products')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">#{order._id.slice(-8)}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Link href={`/user/order-confirmation/${order._id}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">View order</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            {/* Order Status Timeline */}
            {orders.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold">Latest Order Status</h2>
                  <p className="text-sm text-gray-500">Tracking your most recent order</p>
                </div>
                <div className="p-6">
                  {orders.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Order #{orders[0]._id.slice(-8)}</h3>
                        <div>{formatDate(orders[0].createdAt)}</div>
                      </div>
                      
                      <div className="relative mt-6 pb-4">
                        {/* Timeline */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        
                        {/* Order Placed */}
                        <div className="relative flex items-start mb-6">
                          <div className="flex-shrink-0 z-10">
                            <div className="bg-green-600 rounded-full h-10 w-10 flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="font-medium">Order Placed</h4>
                            <p className="text-sm text-gray-500">Your order has been placed</p>
                            <p className="text-xs text-gray-400">{formatDate(orders[0].createdAt)}</p>
                          </div>
                        </div>
                        
                        {/* Processing */}
                        <div className="relative flex items-start mb-6">
                          <div className="flex-shrink-0 z-10">
                            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                              ['processing', 'shipped', 'delivered'].includes(orders[0].status) 
                                ? 'bg-blue-600' : 'bg-gray-200'
                            }`}>
                              <Clock className={`h-5 w-5 ${
                                ['processing', 'shipped', 'delivered'].includes(orders[0].status) 
                                  ? 'text-white' : 'text-gray-400'
                              }`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${
                              ['processing', 'shipped', 'delivered'].includes(orders[0].status) 
                                ? 'text-gray-900' : 'text-gray-400'
                            }`}>Processing</h4>
                            <p className={`text-sm ${
                              ['processing', 'shipped', 'delivered'].includes(orders[0].status) 
                                ? 'text-gray-500' : 'text-gray-400'
                            }`}>Your order is being processed</p>
                          </div>
                        </div>
                        
                        {/* Shipped */}
                        <div className="relative flex items-start mb-6">
                          <div className="flex-shrink-0 z-10">
                            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                              ['shipped', 'delivered'].includes(orders[0].status) 
                                ? 'bg-purple-600' : 'bg-gray-200'
                            }`}>
                              <Truck className={`h-5 w-5 ${
                                ['shipped', 'delivered'].includes(orders[0].status) 
                                  ? 'text-white' : 'text-gray-400'
                              }`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${
                              ['shipped', 'delivered'].includes(orders[0].status) 
                                ? 'text-gray-900' : 'text-gray-400'
                            }`}>Shipped</h4>
                            <p className={`text-sm ${
                              ['shipped', 'delivered'].includes(orders[0].status) 
                                ? 'text-gray-500' : 'text-gray-400'
                            }`}>Your order has been shipped</p>
                          </div>
                        </div>
                        
                        {/* Delivered */}
                        <div className="relative flex items-start">
                          <div className="flex-shrink-0 z-10">
                            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                              orders[0].status === 'delivered' 
                                ? 'bg-green-600' : 'bg-gray-200'
                            }`}>
                              <CheckCircle className={`h-5 w-5 ${
                                orders[0].status === 'delivered' 
                                  ? 'text-white' : 'text-gray-400'
                              }`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${
                              orders[0].status === 'delivered' 
                                ? 'text-gray-900' : 'text-gray-400'
                            }`}>Delivered</h4>
                            <p className={`text-sm ${
                              orders[0].status === 'delivered' 
                                ? 'text-gray-500' : 'text-gray-400'
                            }`}>Your order has been delivered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 