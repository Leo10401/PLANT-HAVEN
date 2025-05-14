"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import {
  Leaf,
  Package,
  ChevronRight,
  User,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  Settings,
  Tag,
  Plus,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  RefreshCcw,
  Box,
  Calendar,
  BarChart4,
  HelpCircle,
  LogOut,
  Minus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SellerDashboard() {
  const router = useRouter()
  const [timeframe, setTimeframe] = useState("weekly")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [popularProducts, setPopularProducts] = useState([])
  const [stats, setStats] = useState({
    daily: {
      orders: 0,
      revenue: 0,
      visitors: 0,
      conversionRate: 0,
    },
    weekly: {
      orders: 0,
      revenue: 0,
      visitors: 0,
      conversionRate: 0,
    },
    monthly: {
      orders: 0,
      revenue: 0,
      visitors: 0,
      conversionRate: 0,
    },
  })
  const [lowStockItems, setLowStockItems] = useState([])
  
  // Stock dialog state
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [newStockValue, setNewStockValue] = useState("")
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // Fetch seller data
  const fetchSellerData = async () => {
    try {
      setIsLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication required. Please log in.")
        router.push("/identify")
        return
      }
      
      // Make API calls with the token in headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
      // Fetch seller profile
      console.log("Fetching seller profile...")
      try {
        const sellerResponse = await axios.get(`${API_BASE_URL}/seller/getbyuser`, config)
        console.log("Seller data received:", sellerResponse.data)
        
        // Store seller ID for consistent use across the app
        const sellerId = sellerResponse.data._id.toString();
        localStorage.setItem('sellerId', sellerId);
        
        setUser({
          id: sellerId,
          name: sellerResponse.data.name,
          email: sellerResponse.data.email,
          shopName: sellerResponse.data.shopName,
          avatar: "/placeholder.svg?height=40&width=40",
        })
        
        // Fetch seller's products
        console.log("Fetching products for seller ID:", sellerId)
        
        const productsResponse = await axios.get(`${API_BASE_URL}/prod/seller`, config)
        console.log("Products received:", productsResponse.data.length)
        setProducts(productsResponse.data)
        
        // Find popular products (sort by sold count)
        const sortedProducts = [...productsResponse.data].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 3)
        setPopularProducts(sortedProducts.map(product => ({
          id: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 
            ? product.images[0] 
            : "/placeholder.svg?height=80&width=80",
          price: product.price,
          stock: product.stock || 0,
          sold: product.sold || 0,
        })))
        
        // Find low stock items (less than 10 in stock)
        const lowStock = productsResponse.data
          .filter(product => (product.stock || 0) < 10)
          .sort((a, b) => (a.stock || 0) - (b.stock || 0))
          .slice(0, 2)
        setLowStockItems(lowStock)
        
        // Fetch seller's orders
        console.log("Fetching orders for seller ID:", sellerId)
        try {
          const ordersResponse = await axios.get(`${API_BASE_URL}/orders/seller/${sellerId}`, config)
          
          // Filter orders
          const allOrders = ordersResponse.data.orders || []
          console.log("Orders received:", allOrders.length)
          
          setRecentOrders(allOrders.slice(0, 4).map(order => ({
            id: order._id,
            customer: order.shippingAddress?.name || "Customer",
            date: formatOrderDate(order.createdAt),
            amount: calculateOrderTotal(order),
            status: order.status,
            items: order.items.length,
          })))
          
          // Calculate statistics
          calculateStats(allOrders)
        } catch (orderError) {
          console.error("Error fetching orders:", orderError.response?.data || orderError);
          toast.error("Could not load orders. Will try again later.");
          
          // Don't stop the entire dashboard if orders fail
          setRecentOrders([]);
          calculateStats([]);
        }
        
      } catch (apiError) {
        console.error("API error details:", apiError.response?.data || apiError.message)
        
        // Handle specific error cases
        if (apiError.response?.status === 401) {
          toast.error("Session expired. Please log in again.")
          localStorage.removeItem("token")
          router.push("/identify")
        } else if (apiError.response?.status === 404) {
          toast.error("Seller account not found.")
        } else {
          toast.error(`API error: ${apiError.response?.data?.message || apiError.message}`)
        }
      }
      
    } catch (error) {
      console.error("Error fetching seller data:", error)
      toast.error("Failed to load dashboard data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch seller info when component mounts
  useEffect(() => {
    fetchSellerData()
  }, [router])
  
  // Calculate stats based on orders
  const calculateStats = (orders) => {
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay
    
    const dailyOrders = orders.filter(order => new Date(order.createdAt) >= new Date(now - oneDay))
    const weeklyOrders = orders.filter(order => new Date(order.createdAt) >= new Date(now - oneWeek))
    const monthlyOrders = orders.filter(order => new Date(order.createdAt) >= new Date(now - oneMonth))
    
    const calculateRevenue = (orderList) => {
      return orderList.reduce((total, order) => total + calculateOrderTotal(order), 0)
    }
    
    const dailyRevenue = calculateRevenue(dailyOrders)
    const weeklyRevenue = calculateRevenue(weeklyOrders)
    const monthlyRevenue = calculateRevenue(monthlyOrders)
    
    // Estimate visitors and conversion rates based on order counts
    // In a real app, you'd get this from analytics
    const estimatedDailyVisitors = Math.max(dailyOrders.length * 20, 10)
    const estimatedWeeklyVisitors = Math.max(weeklyOrders.length * 15, 100)
    const estimatedMonthlyVisitors = Math.max(monthlyOrders.length * 10, 500)
    
    setStats({
      daily: {
        orders: dailyOrders.length,
        revenue: dailyRevenue,
        visitors: estimatedDailyVisitors,
        conversionRate: estimatedDailyVisitors > 0 ? ((dailyOrders.length / estimatedDailyVisitors) * 100).toFixed(1) : 0,
      },
      weekly: {
        orders: weeklyOrders.length,
        revenue: weeklyRevenue,
        visitors: estimatedWeeklyVisitors,
        conversionRate: estimatedWeeklyVisitors > 0 ? ((weeklyOrders.length / estimatedWeeklyVisitors) * 100).toFixed(1) : 0,
      },
      monthly: {
        orders: monthlyOrders.length,
        revenue: monthlyRevenue,
        visitors: estimatedMonthlyVisitors,
        conversionRate: estimatedMonthlyVisitors > 0 ? ((monthlyOrders.length / estimatedMonthlyVisitors) * 100).toFixed(1) : 0,
      },
    })
  }
  
  // Calculate total from order items
  const calculateOrderTotal = (order) => {
    if (order.totalAmount) return order.totalAmount
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
  
  // Format order date for display
  const formatOrderDate = (dateString) => {
    const orderDate = new Date(dateString)
    const now = new Date()
    const diff = now - orderDate
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 7) return `${days} days ago`
    
    return orderDate.toLocaleDateString()
  }
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/identify")
  }

  // Update product stock
  const updateProductStock = async (productId, newStock) => {
    try {
      setIsLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/identify")
        return
      }
      
      // Update product stock via API
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
      await axios.put(`${API_BASE_URL}/prod/${productId}`, { stock: newStock }, config)
      
      // Update local state
      setLowStockItems(prevItems => 
        prevItems.map(item => 
          item._id === productId ? {...item, stock: newStock} : item
        ).filter(item => item.stock < 10)
      )
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === productId ? {...product, stock: newStock} : product
        )
      )
      
      setPopularProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? {...product, stock: newStock} : product
        )
      )
      
      toast.success("Stock updated successfully")
    } catch (error) {
      console.error("Error updating stock:", error)
      toast.error("Failed to update stock")
    } finally {
      setIsLoading(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Processing
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
            Shipped
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const activeStats = stats[timeframe]

  const getNextPayoutDate = () => {
    const now = new Date()
    const nextPayout = new Date(now)
    nextPayout.setDate(now.getDate() + 15)
    return nextPayout.toLocaleDateString()
  }

  // Handle stock dialog form submission
  const handleStockUpdate = (e) => {
    e.preventDefault()
    if (selectedProduct) {
      updateProductStock(selectedProduct._id, parseInt(newStockValue))
    }
    setIsStockDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-green-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
              <img src="/qkartlogo.png" alt="" height={64} width={40} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Qkart
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/seller/dashboard" className="text-sm font-medium text-green-600">
              Dashboard
            </Link>
            <Link
              href="/seller/manage-products"
              className="text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              Products
            </Link>
            <Link href="/seller/orders" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Orders
            </Link>
            <Link
              href="/seller/product-orders"
              className="text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              Product Orders
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        ) : user ? (
          <>
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Seller"}!</h1>
                <p className="text-gray-600">{user?.shopName || "Your Shop"} — Here's what's happening with your store today.</p>
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  onClick={() => router.push("/seller/sellproduct")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Product
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                      <Settings className="mr-2 h-4 w-4" /> Manage Store
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Store Settings</DropdownMenuItem>
                    <DropdownMenuItem>Payment Methods</DropdownMenuItem>
                    <DropdownMenuItem>Shipping Options</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="rounded-xl border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{formatCurrency(activeStats.revenue)}</p>
                        <Badge className="bg-green-100 text-green-600 mb-1">+12%</Badge>
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Orders</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{activeStats.orders}</p>
                        <Badge className="bg-green-100 text-green-600 mb-1">+5%</Badge>
                      </div>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Visitors</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{activeStats.visitors}</p>
                        <Badge className="bg-green-100 text-green-600 mb-1">+18%</Badge>
                      </div>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{activeStats.conversionRate}%</p>
                        <Badge className="bg-green-100 text-green-600 mb-1">+2%</Badge>
                      </div>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <BarChart4 className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Range Selector */}
            <div className="flex justify-end mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-1 flex space-x-1">
                <button
                  className={`px-3 py-1 text-sm rounded-md ${timeframe === "daily" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"}`}
                  onClick={() => setTimeframe("daily")}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${timeframe === "weekly" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"}`}
                  onClick={() => setTimeframe("weekly")}
                >
                  Weekly
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${timeframe === "monthly" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"}`}
                  onClick={() => setTimeframe("monthly")}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Orders */}
              <div className="lg:col-span-2">
                <Card className="rounded-xl border-green-100 mb-8">
                  <CardHeader className="pb-3 pt-6 px-6">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-bold">Recent Orders</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 p-0 h-auto"
                        onClick={() => router.push("/seller/orders")}
                      >
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>Process your latest orders</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-5">
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => router.push(`/seller/orders/${order.id}`)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-white p-2 rounded-full">
                                <ShoppingBag className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{order.customer}</p>
                                  <span className="text-xs text-gray-500">{order.date}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Order #{order.id.slice(-6)} • {order.items} {order.items === 1 ? "item" : "items"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <p className="font-medium">{formatCurrency(order.amount)}</p>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No recent orders</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Analytics */}
                <Card className="rounded-xl border-green-100">
                  <CardHeader className="pb-3 pt-6 px-6">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-bold">Sales Analytics</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-gray-700 p-0 h-auto"
                        onClick={fetchSellerData}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>Your sales performance over time</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-lg relative overflow-hidden">
                      {/* Mock Chart */}
                      <div className="absolute inset-0">
                        <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end">
                          <div className="flex items-end justify-around w-full h-full px-6 pb-10">
                            {[35, 65, 45, 70, 55, 80, 60].map((height, i) => (
                              <div
                                key={i}
                                className="w-6 rounded-t-md bg-gradient-to-t from-green-600 to-emerald-400"
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-10 flex justify-around px-6">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                            <div key={i} className="text-xs text-gray-500">
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chart Overlay */}
                      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-500" />
                          <span className="text-xs text-gray-700 font-medium">Sales</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Products & Store Health */}
              <div>
                <Card className="rounded-xl border-green-100 mb-8">
                  <CardHeader className="pb-3 pt-6 px-6">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-bold">Popular Products</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 p-0 h-auto"
                        onClick={() => router.push("/seller/manage-products")}
                      >
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>Your best-selling items</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-4">
                      {popularProducts.length > 0 ? (
                        popularProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3"
                            onClick={() => router.push(`/seller/manage-products/${product.id}`)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{product.name}</h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
                                <span className="text-xs text-gray-500">{product.sold} sold</span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                product.stock < 10
                                  ? "bg-red-50 text-red-600 border-red-200"
                                  : "bg-green-50 text-green-600 border-green-200"
                              }
                            >
                              {product.stock} left
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No products found</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <Button
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                        onClick={() => router.push("/seller/sellproduct")}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Product
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border-green-100">
                  <CardHeader className="pb-3 pt-6 px-6">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg font-bold">Store Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm">Store Visibility</span>
                        </div>
                        <Badge className="bg-green-100 text-green-600">Online</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Box className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm">Products</span>
                        </div>
                        <span className="text-sm font-medium">{products.length} active</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-yellow-600" />
                          </div>
                          <span className="text-sm">Pending Orders</span>
                        </div>
                        <span className="text-sm font-medium">
                          {recentOrders.filter(order => order.status === 'pending' || order.status === 'processing').length} orders
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm">Next Payout</span>
                        </div>
                        <span className="text-sm font-medium">{getNextPayoutDate()}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        variant="outline"
                        className="w-full border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => router.push("/seller/settings")}
                      >
                        <Settings className="mr-2 h-4 w-4" /> Store Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Access Tabs */}
            <div className="mt-8">
              <Tabs defaultValue="quickActions" className="w-full">
                <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto p-1 bg-gray-100 rounded-lg">
                  <TabsTrigger value="quickActions" className="py-2">
                    Quick Actions
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="py-2">
                    Low Inventory
                  </TabsTrigger>
                  <TabsTrigger value="help" className="py-2">
                    Help & Resources
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="quickActions" className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        icon: <Package className="h-5 w-5" />,
                        title: "Create Product",
                        href: "/seller/sellproduct",
                        color: "bg-blue-100 text-blue-600",
                      },
                      {
                        icon: <Truck className="h-5 w-5" />,
                        title: "Process Orders",
                        href: "/seller/orders?status=pending",
                        color: "bg-yellow-100 text-yellow-600",
                      },
                      {
                        icon: <Tag className="h-5 w-5" />,
                        title: "Manage Inventory",
                        href: "/seller/manage-products",
                        color: "bg-purple-100 text-purple-600",
                      },
                      {
                        icon: <BarChart4 className="h-5 w-5" />,
                        title: "View Analytics",
                        href: "/seller/analytics",
                        color: "bg-emerald-100 text-emerald-600",
                      },
                    ].map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="bg-white border border-gray-200 hover:bg-gray-50 justify-start h-auto py-4"
                        onClick={() => router.push(action.href)}
                      >
                        <div className={`${action.color} p-2 rounded-full mr-3`}>{action.icon}</div>
                        <span>{action.title}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="inventory" className="pt-6">
                  <div className="bg-white rounded-xl border border-green-100 p-4">
                    <h3 className="text-sm font-medium mb-3">Low Stock Items</h3>
                    <div className="space-y-3">
                      {lowStockItems.length > 0 ? (
                        lowStockItems.map((item) => (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded-md overflow-hidden bg-white">
                                <Image
                                  src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder.svg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-red-600">Only {item.stock} left in stock</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                              onClick={(e) => {
                                e.preventDefault()
                                setIsStockDialogOpen(true)
                                setSelectedProduct(item)
                                setNewStockValue(item.stock.toString())
                              }}
                            >
                              Update Stock
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No low stock items found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="help" className="pt-6">
                  <div className="bg-white rounded-xl border border-green-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-green-600" />
                          Seller Resources
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">Access guides and tools to grow your business</p>
                        <div className="space-y-3">
                          {["Seller Handbook", "Photography Tips", "SEO Best Practices", "Marketing Strategies"].map(
                            (resource, i) => (
                              <a key={i} href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                                <ArrowUpRight className="h-4 w-4" />
                                {resource}
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                        <p className="text-gray-600 text-sm mb-4">Need help? Our support team is ready to assist you.</p>
                        <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-50 p-4 rounded-lg mb-4">
                <p className="text-red-600 mb-2">Failed to load dashboard data</p>
                <p className="text-gray-600 text-sm">There was a problem connecting to the server</p>
              </div>
              <Button 
                onClick={fetchSellerData}
                className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Retry
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-green-100 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Qkart. All rights reserved.</p>
          <div className="mt-3 flex justify-center space-x-4">
            <button
              onClick={() => toast.success("Success notification!")}
              className="text-xs text-green-600 hover:underline"
            >
              Test Success Toast
            </button>
            <button
              onClick={() => toast.error("Error notification!")}
              className="text-xs text-red-600 hover:underline"
            >
              Test Error Toast
            </button>
          </div>
        </div>
      </footer>

      {/* Stock Update Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>Enter the new stock for the selected product.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockUpdate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  type="number"
                  min="0"
                  className="col-span-3"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
