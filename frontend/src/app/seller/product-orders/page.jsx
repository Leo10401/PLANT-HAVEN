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
  Search,
  Filter,
  ShoppingBag,
  ChevronDown,
  ArrowUpDown,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SellerProductOrders() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);

  useEffect(() => {
    if (loading) return;

    // Check if user is authenticated and is a seller
    if (!user) {
      toast.error('Please login to view your seller orders');
      router.push('/identify');
      return;
    }

    fetchSellerProducts();
  }, [user, loading, router]);

  useEffect(() => {
    if (products.length > 0) {
      fetchOrders();
    }
  }, [products]);

  const fetchSellerProducts = async () => {
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
      
      const response = await fetch(`http://localhost:5000/prod/seller`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data);
        console.log(`Retrieved ${data.length || 0} seller products`);
      } else {
        toast.error(data.message || 'Failed to load products');
        
        if (response.status === 401 || response.status === 403) {
          router.push('/identify');
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchOrders = async () => {
    try {
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
        // Process the orders to organize by product
        const processedOrders = processOrdersByProduct(data.orders);
        setOrders(processedOrders);
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

  const processOrdersByProduct = (ordersData) => {
    // Create a map of products with their orders
    const productOrdersMap = {};
    
    // Collect product IDs for reference
    const productIds = products.map(product => product._id);
    
    // Process each order
    ordersData.forEach(order => {
      // Filter order items to only include products from this seller
      const sellerItems = order.items.filter(item => 
        productIds.includes(item.productId)
      );
      
      // For each seller item, add to the product's order list
      sellerItems.forEach(item => {
        if (!productOrdersMap[item.productId]) {
          productOrdersMap[item.productId] = [];
        }
        
        // Add this order with the specific item details
        productOrdersMap[item.productId].push({
          orderId: order._id,
          orderDate: order.createdAt,
          status: order.status,
          customerInfo: order.shippingAddress,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.price * item.quantity,
          paymentMethod: order.paymentMethod,
          isPaid: order.isPaid,
          paidAt: order.paidAt,
          isDelivered: order.isDelivered,
          deliveredAt: order.deliveredAt,
          fullOrder: order
        });
      });
    });
    
    return productOrdersMap;
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
        fetchOrders(); // Refresh all orders
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const toggleProductOrders = (productId) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  // Get product name by ID
  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Get product image by ID
  const getProductImage = (productId) => {
    const product = products.find(p => p._id === productId);
    return product && product.images && product.images.length > 0 
      ? product.images[0] 
      : "/placeholder.svg";
  };

  // Filter and sort the product list
  const filteredProducts = products.filter(product => {
    // Search by name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return product.name.toLowerCase().includes(query);
    }
    return true;
  });

  // Only show products with orders if filter is applied
  const productsToDisplay = productFilter === 'with-orders' 
    ? filteredProducts.filter(product => orders[product._id] && orders[product._id].length > 0)
    : filteredProducts;

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product orders...</p>
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
            <Link href="/seller/orders" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              All Orders
            </Link>
            <Link href="/seller/product-orders" className="text-sm font-medium text-green-600">
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
            <span className="text-gray-700 font-medium">Product Orders</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Product Orders</h1>
          
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full md:w-64"
              />
            </div>
            
            {/* Product Filter */}
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-200">
                <SelectValue placeholder="Filter products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="with-orders">With Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products with Orders */}
        <div className="space-y-6">
          {productsToDisplay.length > 0 ? (
            productsToDisplay.map(product => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {/* Product Header */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleProductOrders(product._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image 
                        src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Price: ₹{product.price.toFixed(2)}</span>
                        <span>Stock: {product.stock}</span>
                        <span>
                          Orders: {orders[product._id] ? orders[product._id].length : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronDown className={`h-5 w-5 transition-transform ${expandedProductId === product._id ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                
                {/* Orders for this product */}
                {expandedProductId === product._id && (
                  <div>
                    <Separator />
                    {orders[product._id] && orders[product._id].length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders[product._id].map((order, idx) => (
                              <TableRow key={`${order.orderId}-${idx}`}>
                                <TableCell className="font-medium">{order.orderId.substring(order.orderId.length - 8)}</TableCell>
                                <TableCell>{formatDate(order.orderDate)}</TableCell>
                                <TableCell>
                                  {order.customerInfo.address.split(',')[0]}, {order.customerInfo.city}
                                </TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
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
                                      {order.status === 'pending' && (
                                        <DropdownMenuItem onClick={() => updateOrderStatus(order.orderId, 'processing')}>
                                          Mark as Processing
                                        </DropdownMenuItem>
                                      )}
                                      {order.status === 'processing' && (
                                        <DropdownMenuItem onClick={() => updateOrderStatus(order.orderId, 'shipped')}>
                                          Mark as Shipped
                                        </DropdownMenuItem>
                                      )}
                                      {order.status === 'shipped' && (
                                        <DropdownMenuItem onClick={() => updateOrderStatus(order.orderId, 'delivered')}>
                                          Mark as Delivered
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => setSelectedOrder(order.fullOrder)}
                                      >
                                        View Full Order
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
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
                        <p className="text-gray-500">
                          This product hasn't received any orders yet
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'Try changing your search terms' : 'You don\'t have any products yet'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/seller/sellproduct')}
                >
                  Add New Product
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedOrder(null)}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Order Information</h3>
                    <p className="text-sm text-gray-600">
                      Order ID: {selectedOrder._id}<br />
                      Date: {formatDate(selectedOrder.createdAt)}<br />
                      Status: {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}<br />
                      Payment: {selectedOrder.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : selectedOrder.paymentMethod}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                    <address className="not-italic text-sm text-gray-600">
                      {selectedOrder.shippingAddress.address}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                      {selectedOrder.shippingAddress.country}<br />
                      Phone: {selectedOrder.shippingAddress.phoneNumber}
                    </address>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-700 mb-2">Items</h3>
                <div className="space-y-3 mb-6">
                  {selectedOrder.items.map((item, idx) => {
                    // Check if this is a product from this seller
                    const isSellerProduct = products.some(p => p._id === item.productId);
                    
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-4 p-3 border rounded-lg ${
                          isSellerProduct ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="relative h-14 w-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image 
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium">{item.name}</h5>
                            {isSellerProduct && (
                              <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
                                Your Product
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            <span>₹{item.price.toFixed(2)} each</span>
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-700">Total Amount</h3>
                    <p className="text-xl font-bold">₹{selectedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-x-2">
                    {selectedOrder.status === 'pending' && (
                      <Button
                        onClick={() => {
                          updateOrderStatus(selectedOrder._id, 'processing');
                          setSelectedOrder(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Process Order
                      </Button>
                    )}
                    {selectedOrder.status === 'processing' && (
                      <Button
                        onClick={() => {
                          updateOrderStatus(selectedOrder._id, 'shipped');
                          setSelectedOrder(null);
                        }}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <Button
                        onClick={() => {
                          updateOrderStatus(selectedOrder._id, 'delivered');
                          setSelectedOrder(null);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                    
                    <Button
                      variant="outline" 
                      onClick={() => setSelectedOrder(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 
