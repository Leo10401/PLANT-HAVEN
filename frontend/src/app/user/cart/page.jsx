"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Leaf,
  Heart,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  Clock,
  Check,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/context/CartContext"
import { useSelectedItems } from "@/context/SelectedItemsContext"
import { CartIcon } from '@/components/ui/CartIcon'

export default function CartPage() {
  const router = useRouter()
  const { cartItems, loading, error, updateQuantity, removeFromCart } = useCart()
  const { updateSelectedItems, updateSelectedItemsData, updateOrderSummary } = useSelectedItems()

  // State for selected items and promo code
  const [selectedItems, setSelectedItems] = useState([])
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState(false)

  // Calculate totals
  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)

  // Calculate totals whenever cart items or selected items change
  useEffect(() => {
    // Filter out selected items that have valid products
    const selectedCartItems = cartItems.filter(item => 
      item.product && selectedItems.includes(item.product._id)
    );

    // Calculate subtotal of selected items
    const newSubtotal = selectedCartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      
      const itemPrice = item.product.discount > 0 
        ? item.product.price * (1 - item.product.discount / 100) 
        : item.product.price;
      return sum + itemPrice * item.quantity;
    }, 0);

    // Set shipping based on subtotal
    const newShipping = newSubtotal > 50 ? 0 : 5.99;

    // Calculate tax (assuming 8% tax rate)
    const newTax = newSubtotal * 0.08;

    // Calculate discount from promo code (10% if applied)
    const newDiscount = promoApplied ? newSubtotal * 0.1 : 0;

    // Calculate total
    const newTotal = newSubtotal + newShipping + newTax - newDiscount;

    setSubtotal(newSubtotal);
    setShipping(newShipping);
    setTax(newTax);
    setDiscount(newDiscount);
    setTotal(newTotal);
  }, [cartItems, selectedItems, promoApplied]);

  // Toggle item selection
  const toggleItemSelected = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Toggle all items selection
  const toggleAllSelected = (checked) => {
    if (checked) {
      // Only select items with valid products
      setSelectedItems(cartItems
        .filter(item => item.product) // Filter out null products
        .map(item => item.product._id))
    } else {
      setSelectedItems([])
    }
  }

  // Handle quantity update
  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    await updateQuantity(productId, newQuantity)
  }

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId)
    setSelectedItems(prev => prev.filter(id => id !== productId))
  }

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "plant10") {
      setPromoApplied(true)
      setPromoError(false)
    } else {
      setPromoError(true)
      setPromoApplied(false)
    }
  }

  // Handle proceeding to checkout
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) return;
    
    // Get selected items data - make sure to only include valid products
    const selectedCartItems = cartItems
      .filter(item => item.product && selectedItems.includes(item.product._id));
    
    // Update the context with selected items and summary
    updateSelectedItems(selectedItems);
    updateSelectedItemsData(selectedCartItems);
    updateOrderSummary({
      subtotal,
      shipping,
      tax,
      discount,
      total,
      promoApplied
    });
    
    // Navigate to checkout
    router.push('/user/checkout');
  };

  // Check if all items are selected
  const allSelected = cartItems.length > 0 && 
    cartItems.filter(item => item.product).every(item => selectedItems.includes(item.product._id))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <Button 
            onClick={() => router.refresh()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
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
              <div className="flex flex-col">

                <span className="text-lg sm:text-4xl font-bold text-green-600">Qkart</span>
                <span className="text-[10px]">Tiny Hands, Green Lands</span>
              </div>
            
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <CartIcon />
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
            <span className="text-gray-700 font-medium">Shopping Cart</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <ShoppingBag className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any plants to your cart yet.</p>
            <Button
              onClick={() => router.push("/shop")}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Side (2 columns on large screens) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
                {/* Cart Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={(checked) => toggleAllSelected(!!checked)}
                    />
                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                      Select All ({cartItems.filter(item => item.product).length} items)
                    </label>
                  </div>

                  <button
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                    onClick={() => {
                      selectedItems.forEach(productId => removeFromCart(productId))
                      setSelectedItems([])
                    }}
                  >
                    Remove Selected
                  </button>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <div key={item.product?._id || `item-${Math.random()}`} className="p-6">
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="pt-2">
                          <Checkbox
                            id={`item-${item.product?._id || Math.random()}`}
                            checked={item.product && selectedItems.includes(item.product._id)}
                            onCheckedChange={() => item.product && toggleItemSelected(item.product._id)}
                          />
                        </div>

                        {/* Product Image */}
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                          <Image 
                            src={item.product?.images && item.product.images.length > 0 ? item.product.images[0] : "/placeholder.svg"} 
                            alt={item.product?.name || "Product"} 
                            fill 
                            className="object-cover" 
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <h3 className="font-medium text-lg mb-1 truncate">{item.product?.name || "Product Unavailable"}</h3>
                              <p className="text-sm text-gray-500 mb-2">{item.product?.category || "Unknown"}</p>

                              {/* Price */}
                              <div className="flex items-center gap-2 mb-3">
                                {item.product ? (
                                  <>
                                    <span className="font-medium text-green-600">
                                      ₹{(item.product.price * (1 - (item.product.discount || 0) / 100)).toFixed(2)}
                                    </span>
                                    {item.product.discount > 0 && (
                                      <>
                                        <span className="text-sm text-gray-500 line-through">
                                          ₹{item.product.price.toFixed(2)}
                                        </span>
                                        <span className="text-sm text-green-600">
                                          ({item.product.discount}% off)
                                        </span>
                                      </>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-red-500">Product unavailable</span>
                                )}
                              </div>
                            </div>

                              {/* Quantity Controls */}
                            <div className="flex items-center gap-4">
                              {item.product ? (
                                <>
                                  <div className="flex items-center border rounded-lg">
                                    <button
                                      className="p-2 hover:bg-gray-100 transition-colors"
                                      onClick={() => handleQuantityUpdate(item.product._id, item.quantity - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2">{item.quantity}</span>
                                    <button
                                      className="p-2 hover:bg-gray-100 transition-colors"
                                      onClick={() => handleQuantityUpdate(item.product._id, item.quantity + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <button
                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                    onClick={() => handleRemoveItem(item.product._id)}
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                  onClick={() => handleRemoveItem(item._id || '')}
                                >
                                  <Trash2 className="h-5 w-5" /> Remove Unavailable Item
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                  {/* Promo Code */}
                  <div className="mb-6">
                  <div className="flex gap-2">
                      <input
                        type="text"
                      placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <Button
                        onClick={applyPromoCode}
                      className="bg-green-600 hover:bg-green-700"
                      >
                        Apply
                      </Button>
                    </div>
                    {promoError && (
                    <p className="text-red-500 text-sm mt-2">Invalid promo code</p>
                    )}
                  </div>

                {/* Summary Details */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                  <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Checkout Button */}
                  <Button
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  disabled={selectedItems.length === 0}
                  onClick={handleProceedToCheckout}
                  >
                    Proceed to Checkout
                  </Button>

                {/* Trust Badges */}
                <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-5 w-5 text-green-600" />
                    <span>Free Shipping on Orders Over ₹50</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-5 w-5 text-green-600" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
