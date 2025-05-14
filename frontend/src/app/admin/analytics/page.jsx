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
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

// Import the chart components
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');

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

    fetchAnalyticsData();
  }, [user, loading, router, timeRange]);

  const fetchAnalyticsData = async () => {
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
      
      // Fetch analytics data
      const response = await fetch(`http://localhost:5000/admin/analytics?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Not authorized to access admin analytics');
          window.location.href = '/';
          return;
        }
        
        // Try to get the error message from the response
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error(`Error: ${error.message || 'Failed to load analytics data'}`);
      
      // For demo purposes, use sample data if API fails
      setAnalyticsData(getSampleAnalyticsData());
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Sample data for development/demo
  const getSampleAnalyticsData = () => {
    return {
      summary: {
        totalRevenue: 142500,
        totalOrders: 87,
        totalProducts: 124,
        totalUsers: 256,
        totalSellers: 18,
        averageOrderValue: 1638
      },
      sales: {
        daily: [
          { date: '2023-07-01', revenue: 4500 },
          { date: '2023-07-02', revenue: 3800 },
          { date: '2023-07-03', revenue: 5200 },
          { date: '2023-07-04', revenue: 4900 },
          { date: '2023-07-05', revenue: 6100 },
          { date: '2023-07-06', revenue: 5800 },
          { date: '2023-07-07', revenue: 7200 },
          { date: '2023-07-08', revenue: 6500 },
          { date: '2023-07-09', revenue: 5900 },
          { date: '2023-07-10', revenue: 6800 },
          { date: '2023-07-11', revenue: 7500 },
          { date: '2023-07-12', revenue: 8200 },
          { date: '2023-07-13', revenue: 7800 },
          { date: '2023-07-14', revenue: 8500 }
        ]
      },
      categories: [
        { name: 'Plants', count: 45, revenue: 52000 },
        { name: 'Seeds', count: 23, revenue: 18500 },
        { name: 'Tools', count: 18, revenue: 28000 },
        { name: 'Pots', count: 21, revenue: 24000 },
        { name: 'Fertilizers', count: 17, revenue: 20000 }
      ],
      topProducts: [
        { name: 'Snake Plant', sales: 32, revenue: 12800 },
        { name: 'Monstera', sales: 28, revenue: 11200 },
        { name: 'Aloe Vera', sales: 24, revenue: 9600 },
        { name: 'Peace Lily', sales: 22, revenue: 8800 },
        { name: 'Money Plant', sales: 20, revenue: 8000 }
      ],
      userGrowth: [
        { month: 'Jan', users: 120 },
        { month: 'Feb', users: 145 },
        { month: 'Mar', users: 168 },
        { month: 'Apr', users: 189 },
        { month: 'May', users: 208 },
        { month: 'Jun', users: 225 },
        { month: 'Jul', users: 256 }
      ]
    };
  };

  // Define colors for charts
  const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444'];

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
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
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </Link>
                <Link 
                  href="/admin/analytics" 
                  className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all"
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
            <h1 className="text-2xl font-semibold">Analytics & Reports</h1>
            <div className="w-48">
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.summary.totalRevenue)}</div>
                <p className="text-xs text-gray-500">+12.5% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.summary.totalOrders}</div>
                <p className="text-xs text-gray-500">+8.2% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.summary.totalUsers}</div>
                <p className="text-xs text-gray-500">+15.3% from last period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.summary.averageOrderValue)}</div>
                <p className="text-xs text-gray-500">+4.1% from last period</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different analytics views */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            
            {/* Sales Tab */}
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.sales.daily}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => {
                            return new Date(date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            });
                          }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                          labelFormatter={(date) => {
                            return new Date(date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            });
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#10b981" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                    <CardDescription>Revenue distribution across product categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analyticsData.categories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="revenue"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {analyticsData.categories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best-selling products by revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          layout="vertical"
                          data={analyticsData.topProducts}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(value) => `₹${value/1000}k`} />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                          <Legend />
                          <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Products Tab */}
            <TabsContent value="products" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Categories</CardTitle>
                  <CardDescription>Distribution of products by category</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={analyticsData.categories}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Number of Products" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products by Sales</CardTitle>
                  <CardDescription>Products with the highest number of sales</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={analyticsData.topProducts}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#0ea5e9" name="Units Sold" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registrations</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.userGrowth}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          name="Total Users" 
                          stroke="#10b981" 
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">User Statistics</CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Total Users</p>
                          <p className="text-sm font-medium">{analyticsData.summary.totalUsers}</p>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-green-500" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Registered This Month</p>
                          <p className="text-sm font-medium">31</p>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: '28%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Active Users</p>
                          <p className="text-sm font-medium">198</p>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-purple-500" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Total Sellers</p>
                          <p className="text-sm font-medium">{analyticsData.summary.totalSellers}</p>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: '12%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">User Activity</CardTitle>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                          <ShoppingCart className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium">Orders per User</p>
                          <p className="text-xl font-bold">3.2</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                          <DollarSign className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium">Avg Spending per User</p>
                          <p className="text-xl font-bold">₹5,245</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium">Avg Days Between Orders</p>
                          <p className="text-xl font-bold">24</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                          <Store className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium">Returning Customers</p>
                          <p className="text-xl font-bold">64%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
} 