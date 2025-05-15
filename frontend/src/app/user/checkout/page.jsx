"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useSelectedItems } from '@/context/SelectedItemsContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  Leaf,
  ChevronRight,
  CreditCard,
  Truck,
  ShoppingBag,
  Heart,
  MapPin,
  Phone,
  Globe,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartIcon } from '@/components/ui/CartIcon';

export default function Checkout() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { selectedItems, selectedItemsData, orderSummary, clearSelectedItems, updateSelectedItems } = useSelectedItems();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [formData, setFormData] = useState({
    shipping: {
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phoneNumber: ''
    },
    paymentMethod: 'razorpay'
  });
  const [userId, setUserId] = useState(null);

  // Get and store user ID on component mount
  useEffect(() => {
    // Attempt to get user ID from multiple sources
    const extractUserId = () => {
      // First try from user context
      if (user) {
        const id = user._id || user.id;
        if (id) {
          console.log('User ID found in context:', id);
          setUserId(id);
          return;
        }
      }

      // Try from localStorage directly
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        console.log('User ID found in localStorage:', storedUserId);
        setUserId(storedUserId);
        return;
      }

      // Try from user object in localStorage
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const id = parsedUser._id || parsedUser.id;
          if (id) {
            console.log('User ID found in localStorage user object:', id);
            setUserId(id);
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }

      console.warn('No user ID found from any source');
    };

    if (!loading) {
      extractUserId();
    }
  }, [user, loading]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Redirect to cart if no items are selected
    if (selectedItems.length === 0) {
      toast.error('Please select items to checkout');
      router.push('/user/cart');
      return;
    }

    // Wait until the authentication state is loaded
    if (loading) return;
    
    // Check if user is authenticated
    const isUserAuthenticated = isAuthenticated() || !!localStorage.getItem('token');
    
    if (!isUserAuthenticated) {
      toast.error('Please login to checkout');
      router.push('/');
      return;
    }
    
    // Pre-fill shipping info if available
    if (user?.shipping) {
      setFormData(prev => ({
        ...prev,
        shipping: {
          address: user.shipping.address || '',
          city: user.shipping.city || '',
          state: user.shipping.state || '',
          postalCode: user.shipping.postalCode || '',
          country: user.shipping.country || '',
          phoneNumber: user.shipping.phoneNumber || ''
        },
        paymentMethod: user.paymentMethod || 'creditCard'
      }));
    } else {
      // Try to get shipping info from localStorage
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.shipping) {
            setFormData(prev => ({
              ...prev,
              shipping: {
                address: parsedUser.shipping.address || '',
                city: parsedUser.shipping.city || '',
                state: parsedUser.shipping.state || '',
                postalCode: parsedUser.shipping.postalCode || '',
                country: parsedUser.shipping.country || '',
                phoneNumber: parsedUser.shipping.phoneNumber || ''
              },
              paymentMethod: parsedUser.paymentMethod || 'creditCard'
            }));
          }
        }
      } catch (error) {
        console.error('Error getting shipping info from localStorage:', error);
      }
    }
  }, [user, loading, isAuthenticated, router, selectedItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'paymentMethod') {
      setFormData({
        ...formData,
        paymentMethod: value
      });
    } else {
      setFormData({
        ...formData,
        shipping: {
          ...formData.shipping,
          [name]: value
        }
      });
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('Processing');
    toast.loading('Processing payment...', {
      id: 'payment-loading',
    });

    try {
      // Get token for API calls
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        router.push('/');
        return;
      }

      // Validate amount
      if (!orderSummary.total || orderSummary.total <= 0) {
        toast.error('Invalid order amount');
        setIsLoading(false);
        return;
      }

      console.log('Creating Razorpay order with amount:', orderSummary.total);

      // Create Razorpay order
      const response = await fetch('http://localhost:5000/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(orderSummary.total),
          currency: 'INR',
        }),
      });

      // Log response for debugging
      console.log('Razorpay create order response status:', response.status);
      const responseText = await response.text();
      console.log('Razorpay create order response text:', responseText);
      
      let order;
      try {
        order = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(order.error || order.details || 'Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mBrgrYqmzTYUjw', // Fallback to test key
        amount: order.amount,
        currency: order.currency,
        name: 'Qkart',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function(response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('http://localhost:5000/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.success) {
              toast.success('Payment successful!');
              setPaymentStatus('Complete');
              
              // Now create the order with the frontend's existing process
              await processOrder(true, {
                id: response.razorpay_payment_id,
                status: 'Complete',
                update_time: new Date().toISOString(),
              });
            } else {
              toast.error('Payment verification failed!');
              setPaymentStatus('Failed');
              setIsLoading(false);
            }
          } catch (error) {
            console.error('Error during payment verification:', error);
            toast.error('Payment verification failed');
            setPaymentStatus('Failed');
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: formData.shipping.phoneNumber,
        },
        theme: {
          color: '#10b981', // Green color to match your theme
        },
        modal: {
          ondismiss: function() {
            toast.dismiss('payment-loading');
            setIsLoading(false);
            console.log('Payment modal closed');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Error during payment:', error);
      toast.error('Failed to initiate payment');
      setPaymentStatus('Failed');
      setIsLoading(false);
    }
  };

  const processOrder = async (isPaid = false, paymentResult = null) => {
    try {
      // Get token for API calls
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        router.push('/');
        return;
      }
      
      // Prepare order items
      const orderItems = selectedItemsData.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price * (1 - (item.product.discount || 0) / 100),
        name: item.product.name,
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"
      }));
      
      // Create order
      const createOrderResult = await fetch('http://localhost:5000/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          items: orderItems,
          shippingAddress: formData.shipping,
          paymentMethod: formData.paymentMethod,
          paymentResult: paymentResult,
          totalAmount: orderSummary.total,
          status: formData.paymentMethod === 'cashOnDelivery' ? 'pending' : 'processing',
          isPaid: isPaid,
          paidAt: isPaid ? new Date().toISOString() : null
        }),
      });
      
      const orderData = await createOrderResult.json();
      
      if (createOrderResult.ok) {
        toast.success('Order placed successfully!');
        
        // Clear selected items after successful checkout
        clearSelectedItems();
        
        // Debug logs
        console.log('Order created successfully, redirecting to confirmation page');
        console.log('Order ID:', orderData.order._id);
        console.log('Redirect URL:', `/user/order-confirmation/${orderData.order._id}`);
        
        try {
          // Try router.replace first (more reliable for dynamic route params)
          router.replace(`/user/order-confirmation/${orderData.order._id}`);
          
          // Set a fallback manual redirect after a short delay if router navigation fails
          setTimeout(() => {
            if (window.location.pathname !== `/user/order-confirmation/${orderData.order._id}`) {
              console.log('Fallback redirect triggered');
              window.location.href = `/user/order-confirmation/${orderData.order._id}`;
            }
          }, 1000);
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Fallback to manual redirect
          window.location.href = `/user/order-confirmation/${orderData.order._id}`;
        }
      } else {
        toast.error(orderData.message || 'Failed to place order');
        throw new Error('Failed to place order');
      }
    } catch (error) {
      toast.error('Failed to place order');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if we have a userId
      if (!userId) {
        console.error('User ID not found. Current state:', {
          contextUser: user,
          hasToken: !!localStorage.getItem('token'),
          hasLocalUser: !!localStorage.getItem('user')
        });
        toast.error('User authentication error. Please log in again.');
        router.push('/');
        return;
      }
      
      console.log('Proceeding with user ID:', userId);
      
      // Get token for API calls
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        router.push('/');
        return;
      }
      
      // Update user shipping information
      let userUpdateResult;
      try {
        userUpdateResult = await fetch(`http://localhost:5000/user/update/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
        
        const userUpdateData = await userUpdateResult.json();
        
        if (!userUpdateResult.ok) {
          toast.error(userUpdateData.message || 'Failed to update user information');
          throw new Error('Failed to update user information');
        }
      } catch (apiError) {
        console.error('API error updating user:', apiError);
        throw apiError;
      }
      
      // Handle payment method
      if (formData.paymentMethod === 'razorpay') {
        handlePayment();
      } else {
        // For other payment methods (credit card or COD)
        await processOrder(formData.paymentMethod === 'creditCard');
      }
    } catch (error) {
      toast.error('Failed to place order');
      console.error(error);
      setIsLoading(false);
    }
  };

  // Show loading indicator while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
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
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Qkart
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Show user info or login button */}
            {userId ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden md:inline">
                  {user?.name || 'User'}
                </span>
                <button
                  onClick={() => {
                    // Clear all auth data
                    localStorage.removeItem('user');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    toast.success('Logged out successfully');
                    router.push('/');
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/" className="text-sm text-green-600 hover:text-green-800">
                Login
              </Link>
            )}
            
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <CartIcon />
          </div>
        </div>
      </header>
      
      {/* Authentication Notice - shows if we detect issues */}
      {(user === null && localStorage.getItem('token')) && (
        <div className="bg-yellow-50 text-center py-2 border-b border-yellow-100">
          <p className="text-sm text-yellow-800">
            Authentication issues detected. Please try to 
            <button 
              onClick={() => {
                // Clear all auth data
                localStorage.removeItem('user');
                localStorage.removeItem('userId');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                toast.success('Logged out successfully');
                router.push('/');
              }}
              className="underline ml-1 font-medium"
            >
              logout and login again
            </button>
          </p>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-green-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/user/cart" className="hover:text-green-600 transition-colors">
              Cart
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">Complete Your Order</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment - Left Side (2 columns on large screens) */}
          <div className="lg:col-span-2">
            {/* Selected Items Display */}
            <div className="bg-white p-6 rounded-3xl shadow-lg mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-full">
                  <PackageCheck className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Selected Items</h2>
              </div>
              
              <div className="space-y-4">
                {selectedItemsData.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No items selected. Please return to cart.</p>
                    <Button
                      onClick={() => router.push('/user/cart')}
                      className="mt-4 bg-green-600"
                    >
                      Back to Cart
                    </Button>
                  </div>
                ) : (
                  selectedItemsData.map((item) => (
                    <div key={item.product._id} className="flex gap-4 border-b border-gray-100 pb-4">
                      {/* Product Image */}
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <Image 
                          src={item.product.images && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {((item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity).toFixed(2)}
                        </p>
                        {item.product.discount > 0 && (
                          <p className="text-xs text-gray-500 line-through">
                            {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Shipping Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Shipping Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.shipping.address}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      required
                      placeholder="Enter your street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.shipping.city}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      required
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.shipping.state}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      required
                      placeholder="State/Province"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.shipping.postalCode}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      required
                      placeholder="Postal/ZIP Code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.shipping.country}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                      required
                      placeholder="Country"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.shipping.phoneNumber}
                        onChange={handleChange}
                        className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                        required
                        placeholder="Your contact number"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-white p-6 rounded-3xl shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>
                
                <div className="space-y-4">
                  {/* <div className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      id="creditCard"
                      name="paymentMethod"
                      value="creditCard"
                      checked={formData.paymentMethod === 'creditCard'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 rounded-full border-gray-300"
                    />
                    <label htmlFor="creditCard" className="ml-3 flex items-center cursor-pointer">
                      <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                      <span>Credit Card</span>
                    </label>
                  </div> */}
                  
                  <div className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      id="razorpay"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === 'razorpay'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 rounded-full border-gray-300"
                    />
                    <label htmlFor="razorpay" className="ml-3 flex items-center cursor-pointer">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      <span>Razorpay</span>
                      <span className="ml-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Recommended</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      id="cashOnDelivery"
                      name="paymentMethod"
                      value="cashOnDelivery"
                      checked={formData.paymentMethod === 'cashOnDelivery'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 rounded-full border-gray-300"
                    />
                    <label htmlFor="cashOnDelivery" className="ml-3 flex items-center cursor-pointer">
                      <Truck className="h-5 w-5 mr-2 text-gray-600" />
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{orderSummary.shipping === 0 ? 'Free' : `₹${orderSummary.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{orderSummary.tax.toFixed(2)}</span>
                </div>
                {orderSummary.promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Button
                type="submit"
                onClick={handleSubmit}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-3 px-4 rounded-xl font-medium"
                disabled={isLoading || selectedItemsData.length === 0}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </span>
                ) : (
                  'Place Order'
                )}
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="bg-green-100 p-1 rounded-full">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="bg-green-100 p-1 rounded-full">
                    <Truck className="h-4 w-4 text-green-600" />
                  </div>
                  <span>Free Shipping on Orders Over ₹50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
