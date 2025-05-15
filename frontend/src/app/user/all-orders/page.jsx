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
  Filter,
  Search,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export default function UserOrders() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [noOrdersFound, setNoOrdersFound] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      toast.error('Please login to view your orders');
      router.push('/identify');
      return;
    }

    fetchOrders();
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setNoOrdersFound(false);
      
      // Get token and user ID with proper logging
      const token = localStorage.getItem('token');
      let userId = user?._id || localStorage.getItem('userId');
      
      console.log('Fetching orders with:', { 
        hasToken: !!token, 
        userId, 
        userFromContext: user ? JSON.stringify(user) : 'No user in context'
      });
      
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
      
      // Sample direct fetch to see all orders for debugging
      try {
        const debugResponse = await fetch('http://localhost:5000/orders/getall', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': formattedToken
          }
        });
        
        if (debugResponse.ok) {
          const allOrders = await debugResponse.json();
          console.log('All orders in system:', allOrders);
          
          // Check if we can find orders with our userId
          if (Array.isArray(allOrders.orders)) {
            const matchingOrders = allOrders.orders.filter(order => 
              order.userId === userId || 
              order.userId.toString() === userId.toString()
            );
            console.log(`Found ${matchingOrders.length} orders matching user ID ${userId}`);
            
            // If no matching orders but there are orders, check what userIds exist
            if (matchingOrders.length === 0 && allOrders.orders.length > 0) {
              const uniqueUserIds = [...new Set(allOrders.orders.map(order => order.userId))];
              console.log('Unique userIds in orders:', uniqueUserIds);
              
              // Try to match by similar ID (this is just for debugging)
              for (const id of uniqueUserIds) {
                console.log(`Comparing ${userId} with ${id}`);
              }
            }
          }
        }
      } catch (debugError) {
        console.error('Debug fetch error:', debugError);
      }
      
      const apiUrl = `http://localhost:5000/orders/user/${userId}`;
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });

      // Log all response information
      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (response.ok) {
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          console.log(`Successfully loaded ${data.orders.length} orders`);
          
          // Set no orders found flag if the array is empty
          if (data.orders.length === 0) {
            setNoOrdersFound(true);
            console.log('No orders found for this user');
          }
        } else {
          console.error('Response data.orders is not an array:', data.orders);
          toast.error('Invalid data format received from server');
        }
      } else {
        toast.error(data.message || 'Failed to load orders');
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          console.log('Authentication error, redirecting to login');
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

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filter !== 'all' && order.status !== filter) {
      return false;
    }
    
    // Search by order ID or items
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesOrderId = order._id.toLowerCase().includes(query);
      const matchesItems = order.items.some(item => 
        item.name.toLowerCase().includes(query)
      );
      
      return matchesOrderId || matchesItems;
    }
    
    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest':
        return b.totalAmount - a.totalAmount;
      case 'lowest':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
              <img src="/qkartlogo.png" alt="" height={64} width={40} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Qkart
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link href="/Browse-products" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Shop
            </Link>
            <Link href="/user/all-orders" className="text-sm font-medium text-green-600">
              My Orders
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-600 mt-1">View and track all your orders</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px] h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort By */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Amount</SelectItem>
                  <SelectItem value="lowest">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Search */}
            <div className="flex-grow sm:flex-grow-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full sm:w-[260px] pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {sortedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="mx-auto bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mb-4">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {noOrdersFound 
                ? "No Orders Found" 
                : "No Orders Match Your Filter"
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {noOrdersFound 
                ? "You haven't placed any orders yet."
                : "Try changing your search or filter settings."
              }
            </p>
            <Button
              onClick={() => router.push('/shop')}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Shopping
            </Button>
            {filter !== 'all' || searchQuery && (
              <Button
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
                variant="outline"
                className="ml-3"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <React.Fragment key={order._id}>
                      <TableRow className="hover:bg-gray-50 transition-colors" onClick={() => toggleOrderDetails(order._id)}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span>{order._id.slice(-8)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/user/order-confirmation/${order._id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Order Details */}
                      {expandedOrderId === order._id && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-800 mb-2">Order Items</h4>
                                <div className="space-y-3">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-100">
                                      <div className="relative h-12 w-12 overflow-hidden rounded bg-gray-100 flex-shrink-0">
                                        <Image
                                          src={item.image || "/placeholder.svg"}
                                          alt={item.name}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                      <div className="flex-grow">
                                        <h5 className="font-medium text-sm">{item.name}</h5>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                          <span>{formatCurrency(item.price)} × {item.quantity}</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-medium">
                                          {formatCurrency(item.price * item.quantity)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-800 mb-2">Shipping Address</h4>
                                  <div className="bg-white p-3 rounded border border-gray-100">
                                    <address className="not-italic text-gray-600">
                                      {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                                      {order.shippingAddress.state}, {order.shippingAddress.postalCode}<br />
                                      {order.shippingAddress.country}<br />
                                      Phone: {order.shippingAddress.phoneNumber}
                                    </address>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-gray-800 mb-2">Payment Information</h4>
                                  <div className="bg-white p-3 rounded border border-gray-100 text-gray-600">
                                    <p><span className="font-medium">Method:</span> {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' :
                                     order.paymentMethod === 'creditCard' ? 'Credit Card' : order.paymentMethod}</p>
                                    <p><span className="font-medium">Status:</span> {order.isPaid ? 'Paid' : 'Not Paid'}</p>
                                    {order.paidAt && <p><span className="font-medium">Paid on:</span> {formatDate(order.paidAt)}</p>}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 flex justify-end">
                                <Button
                                  onClick={() => router.push(`/user/order-confirmation/${order._id}`)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  View Full Details
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
