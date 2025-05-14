"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  User,
  Home,
  Search,
  Eye,
  TruckIcon,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  Leaf,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (loading) return;

    // Redirect if not authenticated or not admin
    if (!user) {
      toast.error('Please login to access admin dashboard');
      window.location.href = '/identify';
      return;
    }

    if (!isAdmin()) {
      toast.error('You do not have permission to access this page');
      window.location.href = '/';
      return;
    }

    fetchOrders();
  }, [user, loading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        window.location.href = '/identify';
        return;
      }

      // Ensure token is properly formatted
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Fetch orders
      const response = await fetch('http://localhost:5000/admin/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Not authorized to access admin orders');
          window.location.href = '/';
          return;
        }
        
        // Try to get the error message from the response
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(`Error: ${error.message || 'Failed to load orders'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      const token = localStorage.getItem('token');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await fetch(`http://localhost:5000/admin/orders/${selectedOrder._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        setIsStatusDialogOpen(false);
        fetchOrders();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('An error occurred while updating the order status');
    }
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (filter !== 'all' && order.status !== filter) {
      return false;
    }
    
    // Search by order ID or customer name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (order._id && order._id.toLowerCase().includes(query)) ||
        (order.userId?.name && order.userId.name.toLowerCase().includes(query)) ||
        (order.shippingAddress?.name && order.shippingAddress.name.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'processing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (loading || isLoading) {
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
                Qkart Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                <Link 
                  href="/admin/dashboard" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/admin/users" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
                <Link 
                  href="/admin/sellers" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Store className="h-4 w-4" />
                  Sellers
                </Link>
                <Link 
                  href="/admin/products" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Package className="h-4 w-4" />
                  Products
                </Link>
                <Link 
                  href="/admin/orders" 
                  className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </Link>
                <Link 
                  href="/admin/analytics" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Order Management</h1>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search orders..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  <span className={filter === 'all' ? 'text-green-600 font-medium' : ''}>All Orders</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('pending')}>
                  <span className={filter === 'pending' ? 'text-green-600 font-medium' : ''}>Pending</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('processing')}>
                  <span className={filter === 'processing' ? 'text-green-600 font-medium' : ''}>Processing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('shipped')}>
                  <span className={filter === 'shipped' ? 'text-green-600 font-medium' : ''}>Shipped</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('delivered')}>
                  <span className={filter === 'delivered' ? 'text-green-600 font-medium' : ''}>Delivered</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('cancelled')}>
                  <span className={filter === 'cancelled' ? 'text-green-600 font-medium' : ''}>Cancelled</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order._id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {order.userId && order.userId.name ? order.userId.name : (order.shippingAddress?.name || 'Unknown Customer')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatDate(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={order.isPaid ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => router.push(`/admin/orders/${order._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openStatusDialog(order)}
                          >
                            <TruckIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchQuery || filter !== 'all' ? 'No orders match your search criteria.' : 'No orders found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* Order Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order #{selectedOrder?._id?.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="font-medium">Current Status</div>
              <Badge className={selectedOrder ? getStatusBadgeClass(selectedOrder.status) : ''}>
                {selectedOrder?.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">New Status</div>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrderStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 