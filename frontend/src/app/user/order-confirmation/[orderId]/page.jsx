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
  CheckCircle,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  ArrowLeft,
  ShoppingBag,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function OrderConfirmation({ params }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get orderId using React.use() as recommended by Next.js
  const resolvedParams = React.use(params);
  const orderId = resolvedParams.orderId;
  
  // Debug log
  console.log('Order confirmation page loaded with orderId:', orderId);

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user && !loading) {
      toast.error('Please login to view your order');
      router.push('/identify');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching order details for ID:', orderId);

        const response = await fetch(`http://localhost:5000/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        console.log('Order API response:', data);

        if (response.ok) {
          setOrder(data.order);
        } else {
          toast.error(data.message || 'Failed to load order details');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, loading, router]);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="mb-4">
              <div className="bg-red-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
                <Package className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for couldn't be found.</p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => router.push('/user/all-orders')}
                className="bg-green-600 hover:bg-green-700"
              >
                View All Orders
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-green-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
              <img src="/qkartlogo.png" alt="" height={64} width={40} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Plant Haven
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/user/all-orders" className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4" />
              <span>My Orders</span>
            </Link>
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
            <Link href="/user/all-orders" className="hover:text-green-600 transition-colors">
              My Orders
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium">Order Confirmation</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Success Message */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 text-center">
          <div className="mb-4">
            <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Your Order Has Been Placed!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          {order.paymentMethod === 'cashOnDelivery' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-lg mx-auto">
              <p className="text-amber-800 font-medium">
                You've selected Cash on Delivery. Please have the exact amount ready when your order arrives.
              </p>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-full">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Order Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Order Date:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Order ID:</span>
                <span className="font-medium">{order._id}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Payment Method:</span>
                <span className="font-medium capitalize">
                  {order.paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' :
                   order.paymentMethod === 'creditCard' ? 'Credit Card' : 
                   order.paymentMethod}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500 block">Shipping Address:</span>
                  <address className="not-italic font-medium">
                    {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                    {order.shippingAddress.state}, {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </address>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Items Ordered</h3>
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 border-b border-gray-100 pb-4">
                {/* Product Image */}
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image 
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-grow">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                </div>
                
                {/* Price */}
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Order Summary */}
          <div className="md:w-1/2 ml-auto">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-full">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Order Status</h2>
          </div>

          <div className="relative">
            <div className="flex items-center mb-8">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) 
                  ? 'bg-green-600' : 'bg-gray-300'
              }`}>
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Order Placed</h3>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center mb-8">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                ['processing', 'shipped', 'delivered'].includes(order.status) 
                  ? 'bg-green-600' : 'bg-gray-300'
              }`}>
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Processing</h3>
                <p className="text-sm text-gray-500">
                  {['processing', 'shipped', 'delivered'].includes(order.status) 
                    ? 'Your order is being processed' 
                    : 'Waiting for processing'}
                </p>
              </div>
            </div>

            <div className="flex items-center mb-8">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                ['shipped', 'delivered'].includes(order.status) 
                  ? 'bg-green-600' : 'bg-gray-300'
              }`}>
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Shipped</h3>
                <p className="text-sm text-gray-500">
                  {['shipped', 'delivered'].includes(order.status) 
                    ? 'Your order has been shipped' 
                    : 'Waiting for shipment'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
                order.status === 'delivered' 
                  ? 'bg-green-600' : 'bg-gray-300'
              }`}>
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Delivered</h3>
                <p className="text-sm text-gray-500">
                  {order.status === 'delivered' 
                    ? 'Your order has been delivered' 
                    : 'Waiting for delivery'}
                </p>
              </div>
            </div>

            {/* Vertical line connecting steps */}
            <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-gray-200"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => router.push('/user/all-orders')}
            className="bg-green-600 hover:bg-green-700"
          >
            View All Orders
          </Button>
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            Continue Shopping
          </Button>
        </div>
      </main>
    </div>
  );
} 