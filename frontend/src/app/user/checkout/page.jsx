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

export default function Checkout() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const { selectedItems, selectedItemsData, orderSummary, clearSelectedItems } = useSelectedItems();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping: {
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phoneNumber: ''
    },
    paymentMethod: 'creditCard'
  });

  useEffect(() => {
    // Redirect to cart if no items are selected
    if (selectedItems.length === 0) {
      toast.error('Please select items to checkout');
      router.push('/user/cart');
      return;
    }

    // Wait until the authentication state is loaded
    if (loading) return;
    
    // If user is not authenticated, redirect to login
    if (!user && !loading) {
      toast.error('Please login to checkout');
      router.push('/identify');
      return;
    }
    
    // If user has shipping info, pre-fill the form
    if (user?.shipping) {
      setFormData({
        shipping: {
          address: user.shipping.address || '',
          city: user.shipping.city || '',
          state: user.shipping.state || '',
          postalCode: user.shipping.postalCode || '',
          country: user.shipping.country || '',
          phoneNumber: user.shipping.phoneNumber || ''
        },
        paymentMethod: user.paymentMethod || 'creditCard'
      });
    }
  }, [user, loading, router, selectedItems]);

  // For debugging
  useEffect(() => {
    console.log('Auth state:', { user, loading, isAuthenticated: isAuthenticated() });
    
    // Check if the user data is in localStorage even if not in context
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      console.log('LocalStorage:', { 
        hasStoredUser: !!storedUser, 
        hasToken: !!token,
        userData: storedUser ? JSON.parse(storedUser) : null
      });
    } catch (error) {
      console.error('Error checking localStorage:', error);
    }
  }, [user, loading, isAuthenticated]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // If user data is not available in context, try to get from localStorage
      let userId;
      if (user) {
        userId = user._id || user.id;
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser._id || parsedUser.id;
        }
      }
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Use direct API call if context method fails
      const token = localStorage.getItem('token');
      
      let result;
      try {
        result = await fetch(`http://localhost:5000/user/update/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });
        
        const responseData = await result.json();
        
        if (result.ok) {
          // Mock create order (we'd normally send selected items to backend)
          toast.success('Order placed successfully!');
          
          // Clear selected items after successful checkout
          clearSelectedItems();
          
          router.push('/user/all-orders');
        } else {
          toast.error(responseData.message || 'Failed to place order');
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        throw apiError;
      }
    } catch (error) {
      toast.error('Failed to place order');
      console.error(error);
    } finally {
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
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Plant Haven
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors relative">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              {selectedItemsData.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {selectedItemsData.length}
                </span>
              )}
            </button>
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
                          src={item.product.image || "/placeholder.svg"}
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
                          ${((item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity).toFixed(2)}
                        </p>
                        {item.product.discount > 0 && (
                          <p className="text-xs text-gray-500 line-through">
                            ${(item.product.price * item.quantity).toFixed(2)}
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
                  <div className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
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
                  </div>
                  
                  <div className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 rounded-full border-gray-300"
                    />
                    <label htmlFor="paypal" className="ml-3 flex items-center cursor-pointer">
                      <Globe className="h-5 w-5 mr-2 text-gray-600" />
                      <span>PayPal</span>
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
                  <span>${orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{orderSummary.shipping === 0 ? 'Free' : `$${orderSummary.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${orderSummary.tax.toFixed(2)}</span>
                </div>
                {orderSummary.promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${orderSummary.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${orderSummary.total.toFixed(2)}</span>
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
                  <span>Free Shipping on Orders Over $50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
