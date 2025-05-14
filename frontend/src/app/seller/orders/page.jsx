"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Leaf,
  Package,
  ChevronRight,
  Filter,
  Search,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  ChevronDown,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function SellerOrders() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (loading) return;

    // Check if user is authenticated and is a seller
    if (!user) {
      toast.error('Please login to view your seller orders');
      router.push('/identify');
      return;
    }

    fetchOrders();
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Get userId from different sources
      const userId = user?.id || localStorage.getItem('userId');
      
      if (!userId) {
        toast.error('Seller ID not found. Please log in again');
        router.push('/identify');
        return;
      }
      
      console.log('Fetching seller orders for:', userId);
      
      const response = await fetch(`http://localhost:5000/orders/seller/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        console.log(`Retrieved ${data.orders?.length || 0} seller orders`);
      } else {
        toast.error(data.message || 'Failed to load orders');
        
        if (response.status === 401 || response.status === 403) {
          router.push('/identify');
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/orders/update-status/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Order marked as ${status}`);
        // Update order in the UI
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status } : order
          )
        );
      } else {
        toast.error(data.message || `Failed to update order status`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
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
          <p className="mt-4 text-gray-600">Loading orders...</p>
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
            <Link href="/seller/dashboard" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/seller/manage-products" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Products
            </Link>
            <Link href="/seller/orders" className="text-sm font-medium text-green-600">
              Orders
            </Link>
            <Link href="/seller/product-orders" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Product Orders
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/seller/dashboard" className="hover:text-green-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium">Orders</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full md:w-64"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-200">
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
            
            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 border-gray-200">
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
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Shipped</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => order.status === 'shipped').length}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold">
                  {orders.filter(order => order.status === 'delivered').length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {sortedOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map(order => (
                    <>
                      <TableRow key={order._id} className="cursor-pointer hover:bg-gray-50" onClick={() => toggleOrderDetails(order._id)}>
                        <TableCell className="font-medium">{order._id.substring(order._id.length - 8)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.items.length} item(s)</TableCell>
                        <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className="capitalize">
                            {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : order.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {order.status === 'pending' && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'processing')}>
                                  Mark as Processing
                                </DropdownMenuItem>
                              )}
                              {order.status === 'processing' && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'shipped')}>
                                  Mark as Shipped
                                </DropdownMenuItem>
                              )}
                              {order.status === 'shipped' && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order._id, 'delivered')}>
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => toggleOrderDetails(order._id)}>
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>

                      {/* Expanded order details */}
                      {expandedOrderId === order._id && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-gray-50 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shipping Address */}
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
                                  <address className="not-italic text-sm text-gray-600">
                                    {order.shippingAddress.address}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                                    {order.shippingAddress.country}<br />
                                    Phone: {order.shippingAddress.phoneNumber}
                                  </address>
                                </div>

                                {/* Payment Details */}
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-2">Payment Details</h4>
                                  <p className="text-sm text-gray-600">
                                    Method: <span className="capitalize">{order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : order.paymentMethod}</span><br />
                                    Status: {order.isPaid ? 'Paid' : 'Not Paid'}<br />
                                    {order.paidAt && `Payment Date: ${formatDate(order.paidAt)}`}
                                  </p>
                                </div>
                              </div>

                              <Separator className="my-4" />

                              {/* Order Items */}
                              <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                              <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-4 p-2 border border-gray-100 rounded-lg bg-white">
                                    <div className="relative h-14 w-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                      <Image 
                                        src={item.image || "/placeholder.svg"}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="flex-grow">
                                      <h5 className="font-medium">{item.name}</h5>
                                      <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Qty: {item.quantity}</span>
                                        <span>₹{item.price.toFixed(2)} each</span>
                                      </div>
                                    </div>
                                    <div className="font-medium">
                                      ₹{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex justify-end">
                                <div className="w-full md:w-1/3 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span>Free</span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span>₹{order.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 flex justify-end space-x-3">
                                {order.status === 'pending' && (
                                  <Button
                                    onClick={() => updateOrderStatus(order._id, 'processing')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Process Order
                                  </Button>
                                )}
                                {order.status === 'processing' && (
                                  <Button
                                    onClick={() => updateOrderStatus(order._id, 'shipped')}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Mark as Shipped
                                  </Button>
                                )}
                                {order.status === 'shipped' && (
                                  <Button
                                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Mark as Delivered
                                  </Button>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filter !== 'all' 
                  ? 'Try changing your filters or search terms' 
                  : 'You don\'t have any orders yet'}
              </p>
              {(searchQuery || filter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
