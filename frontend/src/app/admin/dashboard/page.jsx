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
  ChevronRight,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Leaf,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: [],
    topProducts: [],
    recentUsers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Redirect if not authenticated or not admin
    if (!user) {
      toast.error('Please login to access admin dashboard');
      router.push('/identify');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      router.push('/');
      return;
    }

    fetchDashboardData();
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        router.push('/identify');
        return;
      }

      // Ensure token is properly formatted
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('Fetching dashboard data...');
      // Fetch dashboard stats
      const response = await fetch('http://localhost:5000/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Not authorized to access admin dashboard');
          router.push('/');
          return;
        }
        
        // Try to get the error message from the response
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      console.log('Dashboard data received:', data);
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(`Error: ${error.message || 'Failed to load dashboard data'}`);
      
      // Use sample data as fallback
      setStats(sampleStats);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await fetch(`http://localhost:5000/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': formattedToken
        }
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('An error occurred while deleting the user');
    }
  };

  const handleDeleteSeller = async (sellerId) => {
    if (!confirm('Are you sure you want to delete this seller?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await fetch(`http://localhost:5000/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': formattedToken
        }
      });

      if (response.ok) {
        toast.success('Seller deleted successfully');
        fetchDashboardData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete seller');
      }
    } catch (error) {
      console.error('Error deleting seller:', error);
      toast.error('An error occurred while deleting the seller');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Sample data for testing - this would come from the API in a real app
  const sampleStats = {
    totalUsers: 234,
    totalSellers: 42,
    totalProducts: 587,
    totalOrders: 1254,
    recentOrders: [
      { id: 'ORD123456', user: 'John Doe', amount: 129.99, status: 'completed', date: '2023-07-15' },
      { id: 'ORD123457', user: 'Jane Smith', amount: 84.50, status: 'processing', date: '2023-07-14' },
      { id: 'ORD123458', user: 'Robert Johnson', amount: 235.00, status: 'pending', date: '2023-07-14' },
      { id: 'ORD123459', user: 'Emily Davis', amount: 49.99, status: 'completed', date: '2023-07-13' },
      { id: 'ORD123460', user: 'Michael Brown', amount: 175.25, status: 'shipped', date: '2023-07-13' }
    ],
    topProducts: [
      { id: 'P001', name: 'Monstera Deliciosa', sales: 124, stock: 45 },
      { id: 'P002', name: 'Fiddle Leaf Fig', sales: 98, stock: 23 },
      { id: 'P003', name: 'Snake Plant', sales: 87, stock: 67 },
      { id: 'P004', name: 'Pothos', sales: 76, stock: 89 },
      { id: 'P005', name: 'Chinese Money Plant', sales: 65, stock: 32 }
    ],
    recentUsers: [
      { id: 'U001', name: 'John Smith', email: 'john@example.com', role: 'user', date: '2023-07-15' },
      { id: 'U002', name: 'Sarah Jones', email: 'sarah@example.com', role: 'user', date: '2023-07-14' },
      { id: 'U003', name: 'Mike Wilson', email: 'mike@example.com', role: 'seller', date: '2023-07-14' },
      { id: 'U004', name: 'Lisa Taylor', email: 'lisa@example.com', role: 'user', date: '2023-07-13' },
      { id: 'U005', name: 'David Brown', email: 'david@example.com', role: 'seller', date: '2023-07-12' }
    ]
  };

  // Use sample data until real API is implemented
  const displayStats = stats.totalUsers ? stats : sampleStats;

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
                  className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all"
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            {/* <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Reports
            </Button> */}
          </div>

          {/* Stats overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.totalSellers}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+5%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500">+18%</span> from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayStats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <span className="text-red-500">-3%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayStats.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.user}</TableCell>
                        <TableCell>
                          <Badge className={
                            order.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' :
                            'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best selling products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayStats.topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell>
                          <Badge className={product.stock > 50 ? 'bg-green-100 text-green-800 hover:bg-green-100' : product.stock > 20 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View All Products
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          </div>

          {/* Recent Users */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Users</CardTitle>
                  <CardDescription>Latest users and sellers who joined the platform</CardDescription>
                </div>
                {/* <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button> */}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayStats.recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : user.role === 'seller' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => user.role === 'seller' ? handleDeleteSeller(user.id) : handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Users
                </Button>
              </div> */}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 