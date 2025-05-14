"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import {
  Leaf,
  Heart,
  ShoppingBag,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Sun,
  Droplets,
  Thermometer,
  Info,
  Plus,
  Minus,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getProduct, getProductReviews, addReview, markReviewHelpful, addToCart } from "@/services/api"
import { useAuth } from "@/context/AuthContext"
import React from "react"
import { CartIcon } from "@/components/ui/CartIcon"
import WriteReviewForm from "@/components/WriteReviewForm"

export default function ProductDetailPage({ params }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  
  // Get productId using React.use() as recommended by Next.js
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  // State for the product page
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [reviewsToShow, setReviewsToShow] = useState(3)
  const [activeTab, setActiveTab] = useState("description")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [canReview, setCanReview] = useState(false)

  // Fetch product and reviews data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productData, reviewsData] = await Promise.all([
          getProduct(productId),
          getProductReviews(productId)
        ])
        setProduct(productData)
        setReviews(reviewsData)
      } catch (err) {
        setError(err.message)
        toast.error("Failed to load product data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  // Check if user can review this product
  useEffect(() => {
    const checkIfCanReview = async () => {
      if (!isAuthenticated() || !user || !productId) return;
      
      try {
        // Fetch user's orders to check if they've purchased this product
        const response = await fetch(`http://localhost:5000/orders/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch orders');
        
        // Check if user has ordered this product and it was delivered
        const hasOrderedAndDelivered = data.orders.some(order => 
          order.status === 'delivered' && 
          order.items.some(item => item.productId === productId)
        );
        
        // Check if user has already reviewed this product
        const hasAlreadyReviewed = reviews.some(review => 
          review.user && review.user._id === user._id
        );
        
        setCanReview(hasOrderedAndDelivered && !hasAlreadyReviewed);
      } catch (error) {
        console.error('Error checking review eligibility:', error);
      }
    };
    
    checkIfCanReview();
  }, [isAuthenticated, user, productId, reviews]);

  // Handle review form submission success
  const handleReviewSuccess = async () => {
    // Refresh reviews
    try {
      const reviewsData = await getProductReviews(productId);
      setReviews(reviewsData);
      setCanReview(false); // User can't review anymore after submitting
      setActiveTab("reviews"); // Switch to reviews tab
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1)
    }
  }

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      toast.error("Please login to add items to cart")
      router.push('/identify')
      return
    }

    try {
      await addToCart(productId, quantity)
      toast.success("Added to cart successfully")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart")
    }
  }

  // Handle wishlist toggle
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist")
  }

  // Handle showing more reviews
  const showMoreReviews = () => {
    setReviewsToShow(reviewsToShow + 3)
  }

  // Handle review helpful
  const handleReviewHelpful = async (reviewId) => {
    try {
      await markReviewHelpful(reviewId)
      const updatedReviews = reviews.map(review => 
        review._id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
      setReviews(updatedReviews)
      toast.success("Thank you for your feedback!")
    } catch (err) {
      toast.error("Failed to mark review as helpful")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error || "Product not found"}</p>
          <Button onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    )
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  // Calculate rating distribution
  const ratingDistribution = Array(5).fill(0)
  reviews.forEach((review) => {
    ratingDistribution[5 - review.rating]++
  })

  // Convert to percentages
  const ratingPercentages = ratingDistribution.map((count) => 
    reviews.length > 0 ? (count / reviews.length) * 100 : 0
  )

  // Calculate discounted price
  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100) 
    : product.price

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
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors">
              <Heart className={`h-5 w-5 ${isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"}`} />
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
            <Link href="/shop" className="hover:text-green-600 transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-green-600 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Product Overview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 p-6 md:p-8">
            {/* Product Images - Left Side (2 columns on large screens) */}
            <div className="lg:col-span-2">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-green-50 mb-4">
                <Image
                  src={product.images ? product.images[activeImage] : product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />

                {/* Image Navigation Arrows */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === 0 ? product.images?.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === product.images?.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ArrowRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">New</span>
                  )}
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      -{product.discount}%
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        activeImage === index ? "border-green-500" : "border-transparent hover:border-green-200"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} - view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Right Side (3 columns on large screens) */}
            <div className="lg:col-span-3 flex flex-col">
              {/* Product Title and Rating */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(averageRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {averageRating ? averageRating.toFixed(1) : "0.0"} ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.discount > 0 ? (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">₹{discountedPrice.toFixed(2)}</span>
                    <span className="text-lg text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
                    <span className="text-sm text-red-500 font-medium">Save {product.discount}%</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold">₹{product.price.toFixed(2)}</span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(product.features || []).map((feature, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-full overflow-hidden w-full sm:w-auto">
                  <button
                    onClick={decreaseQuantity}
                    className="p-3 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button onClick={increaseQuantity} className="p-3 hover:bg-gray-100 transition-colors">
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full py-6"
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>

                <Button
                  onClick={toggleWishlist}
                  variant="outline"
                  className={`rounded-full p-3 ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500" : ""}`} />
                </Button>

                <Button variant="outline" className="rounded-full p-3 border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Shipping and Returns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-white p-2 rounded-full">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Free Shipping</h3>
                    <p className="text-xs text-gray-500">On orders over ₹50</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-white p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">30-Day Guarantee</h3>
                    <p className="text-xs text-gray-500">Easy returns if not satisfied</p>
                  </div>
                </div>
              </div>

              {/* Care Requirements */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl">
                  <Sun className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-medium text-sm">Light</h3>
                  <p className="text-xs text-gray-600">{product.care?.light || "Medium Light"}</p>
                </div>

                <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl">
                  <Droplets className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-medium text-sm">Water</h3>
                  <p className="text-xs text-gray-600">{product.care?.water || "Weekly"}</p>
                </div>

                <div className="flex flex-col items-center text-center p-3 bg-green-50 rounded-xl">
                  <Thermometer className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-medium text-sm">Temperature</h3>
                  <p className="text-xs text-gray-600">{product.care?.temperature || "65-80°F"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
          <Tabs defaultValue="description" className="w-full" onValueChange={setActiveTab}>
            <div className="border-b border-gray-100">
              <div className="container mx-auto px-6 md:px-8">
                <TabsList className="flex w-full justify-start overflow-x-auto bg-transparent h-auto p-0 space-x-8">
                  <TabsTrigger
                    value="description"
                    className={`py-4 px-1 font-medium border-b-2 rounded-none ${
                      activeTab === "description"
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    Description
                  </TabsTrigger>
                  <TabsTrigger
                    value="specifications"
                    className={`py-4 px-1 font-medium border-b-2 rounded-none ${
                      activeTab === "specifications"
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger
                    value="care"
                    className={`py-4 px-1 font-medium border-b-2 rounded-none ${
                      activeTab === "care" ? "border-green-600 text-green-600" : "border-transparent text-gray-500"
                    }`}
                  >
                    Care Guide
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className={`py-4 px-1 font-medium border-b-2 rounded-none ${
                      activeTab === "reviews" ? "border-green-600 text-green-600" : "border-transparent text-gray-500"
                    }`}
                  >
                    Reviews ({reviews.length})
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <TabsContent value="description" className="mt-0">
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">About {product.name}</h2>
                  <p className="mb-4">
                    {product.longDescription ||
                      `The ${product.name} is a beautiful addition to any home or garden. 
                    Known for its stunning appearance and easy care requirements, this plant will thrive in the right conditions 
                    and bring life to your space for years to come.`}
                  </p>
                  <p className="mb-4">
                    Native to tropical regions, this plant has adapted well to indoor environments and can be grown
                    successfully by both beginners and experienced plant enthusiasts. Its distinctive foliage and growth
                    pattern make it a standout piece in any plant collection.
                  </p>
                  <p>
                    Each plant is carefully grown and nurtured in our greenhouse facilities before making its way to
                    your home. We take pride in delivering healthy, vibrant plants that are ready to continue growing in
                    their new environment.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="specifications" className="mt-0">
                <h2 className="text-xl font-bold mb-4">Product Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Botanical Name</span>
                      <span className="font-medium">{product.botanicalName || "Monstera deliciosa"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Plant Type</span>
                      <span className="font-medium">{product.type || "Tropical"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Mature Size</span>
                      <span className="font-medium">{product.size || "3-5 ft. tall"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Sun Exposure</span>
                      <span className="font-medium">{product.care?.light || "Medium Light"}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Soil Type</span>
                      <span className="font-medium">{product.soil || "Well-draining potting mix"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Watering</span>
                      <span className="font-medium">{product.care?.water || "Weekly"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Humidity</span>
                      <span className="font-medium">{product.humidity || "Medium to High"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Propagation</span>
                      <span className="font-medium">{product.propagation || "Stem cuttings"}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="care" className="mt-0">
                <h2 className="text-xl font-bold mb-4">Plant Care Guide</h2>
                <div className="space-y-6">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="light">
                      <AccordionTrigger className="text-left font-medium">
                        <div className="flex items-center gap-3">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <Sun className="h-5 w-5 text-yellow-600" />
                          </div>
                          Light Requirements
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600 mb-2">
                          {product.careGuide?.light ||
                            `The ${product.name} thrives in bright, indirect light. It can tolerate some direct morning 
                          sun but should be protected from harsh afternoon sunlight which can scorch its leaves.`}
                        </p>
                        <p className="text-gray-600">
                          If your plant's leaves are turning yellow, it might be getting too much light. If it's
                          stretching or growing slowly, it might need more light.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="water">
                      <AccordionTrigger className="text-left font-medium">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Droplets className="h-5 w-5 text-blue-600" />
                          </div>
                          Watering Guide
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600 mb-2">
                          {product.careGuide?.water ||
                            `Water your ${product.name} when the top 1-2 inches of soil feels dry to the touch. 
                          This usually means watering once a week during the growing season (spring and summer) and less frequently 
                          during the dormant season (fall and winter).`}
                        </p>
                        <p className="text-gray-600">
                          Always ensure your pot has drainage holes and empty any excess water from the saucer to
                          prevent root rot.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="soil">
                      <AccordionTrigger className="text-left font-medium">
                        <div className="flex items-center gap-3">
                          <div className="bg-brown-100 p-2 rounded-full">
                            <svg className="h-5 w-5 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                              <path
                                d="M6 20.5V6.8a.5.5 0 01.5-.5h11a.5.5 0 01.5.5v13.7M6 10h12M6 14h12M6 18h12"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          Soil & Fertilizer
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600 mb-2">
                          {product.careGuide?.soil ||
                            `Use a well-draining potting mix rich in organic matter. A mix designed for indoor plants 
                          or tropical plants works well for the ${product.name}.`}
                        </p>
                        <p className="text-gray-600">
                          Fertilize monthly during the growing season (spring and summer) with a balanced, water-soluble
                          fertilizer diluted to half the recommended strength. Reduce or eliminate fertilization during
                          the fall and winter months.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="problems">
                      <AccordionTrigger className="text-left font-medium">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-full">
                            <Info className="h-5 w-5 text-red-600" />
                          </div>
                          Common Problems
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">Yellow Leaves</h4>
                            <p className="text-gray-600 text-sm">
                              Usually caused by overwatering or poor drainage. Allow soil to dry out more between
                              waterings.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Brown Leaf Tips</h4>
                            <p className="text-gray-600 text-sm">
                              Often due to low humidity or inconsistent watering. Increase humidity and maintain a
                              regular watering schedule.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Pests</h4>
                            <p className="text-gray-600 text-sm">
                              Watch for spider mites, mealybugs, and scale. Treat with insecticidal soap or neem oil at
                              the first sign of infestation.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <div className="space-y-8">
                  {/* Review Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-100">
                    {/* Overall Rating */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <h3 className="text-2xl font-bold mb-2">{averageRating.toFixed(1)}</h3>
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(averageRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : i < averageRating
                                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                                  : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="col-span-2">
                      <h3 className="font-medium mb-4">Rating Distribution</h3>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating, index) => (
                          <div key={rating} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-16">
                              <span className="text-sm">{rating}</span>
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <Progress value={ratingPercentages[index]} className="h-2 flex-1" />
                            <span className="text-sm text-gray-500 w-12 text-right">
                              {ratingDistribution[index]} ({Math.round(ratingPercentages[index])}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Write a Review */}
                  {isAuthenticated() ? (
                    canReview ? (
                      <div className="mb-8">
                        <WriteReviewForm 
                          productId={productId} 
                          onSuccess={handleReviewSuccess} 
                        />
                      </div>
                    ) : (
                      user && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-8">
                          <p className="text-gray-600 text-sm">
                            {reviews.some(review => review.user && review.user._id === user._id) 
                              ? "You've already reviewed this product. Thank you for your feedback!"
                              : "You need to purchase and receive this product before you can review it."}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg mb-8">
                      <p className="text-gray-600 text-sm">Please <Link href="/identify" className="text-green-600 hover:underline">sign in</Link> to write a review.</p>
                    </div>
                  )}

                  {/* Review List */}
                  <div className="space-y-6">
                    <h3 className="font-bold text-lg">Customer Reviews</h3>

                    {reviews.length > 0 ? (
                      reviews.slice(0, reviewsToShow).map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center">
                                <span className="font-medium text-gray-700">{review.user.name.charAt(0)}</span>
                              </div>
                              <div>
                                <h4 className="font-medium">{review.user.name}</h4>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs text-gray-500 ml-1">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {review.verified && (
                              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Verified Purchase
                              </span>
                            )}
                          </div>

                          <h5 className="font-medium mb-2">{review.title}</h5>
                          <p className="text-gray-600 mb-3">{review.comment}</p>

                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {review.images.map((image, imgIndex) => (
                                <div key={imgIndex} className="relative h-16 w-16 rounded-lg overflow-hidden">
                                  <Image
                                    src={image}
                                    alt={`Review image ${imgIndex + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 mt-3">
                            <button 
                              onClick={() => handleReviewHelpful(review._id)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Helpful ({review.helpful || 0})
                            </button>
                            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                              <MessageCircle className="h-3 w-3" />
                              Reply
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                      </div>
                    )}

                    {reviewsToShow < reviews.length && (
                      <div className="text-center">
                        <Button
                          onClick={showMoreReviews}
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          Load More Reviews
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Similar Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Similar Plants</h2>
            <Link href="/shop" className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <Link
                href={`/shop/${product.id}`}
                key={product.id}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">New</span>
                  )}
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Wishlist button */}
                <button
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log(`Toggle wishlist for product ${product.id}`)
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${product.isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"}`}
                  />
                </button>

                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden bg-green-50">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Quick shop overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      className="bg-white text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log(`Quick add product ${product.id} to cart`)
                      }}
                    >
                      Quick Add
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < product.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                  </div>

                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {product.category}
                  </span>

                  <h3 className="font-medium text-lg mt-2 group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex justify-between items-center mt-4">
                    <div>
                      {product.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl">₹{(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                          <span className="text-sm text-gray-500 line-through">₹{product.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-xl">₹{product.price.toFixed(2)}</span>
                      )}
                    </div>

                    <button
                      className="p-3 bg-green-100 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log(`Add product ${product.id} to cart`)
                      }}
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-green-100">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Plant Haven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Sample product data with additional details
const products = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    category: "Indoor Plants",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    rating: 4.5,
    reviews: 128,
    isNew: true,
    discount: 0,
    isWishlisted: false,
    popularity: 95,
    added: "2023-04-15",
    description:
      "The Monstera Deliciosa, also known as the Swiss Cheese Plant, is famous for its quirky natural leaf holes and is loved for its easy-going nature.",
    features: ["Air Purifying", "Low Maintenance", "Medium Light"],
    stock: 15,
    botanicalName: "Monstera deliciosa",
    type: "Tropical",
    size: "3-5 ft. tall",
    soil: "Well-draining potting mix",
    humidity: "Medium to High",
    propagation: "Stem cuttings",
    care: {
      light: "Medium to Bright Indirect",
      water: "Weekly, allow to dry between waterings",
      temperature: "65-85°F (18-29°C)",
    },
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    category: "Indoor Plants",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
    reviews: 96,
    isNew: false,
    discount: 10,
    isWishlisted: true,
    popularity: 88,
    added: "2023-03-10",
    description:
      "The Fiddle Leaf Fig is a stunning indoor plant with large, violin-shaped leaves that can elevate the look of any space.",
    features: ["Bright Light", "Statement Plant", "Tropical"],
  },
  {
    id: 3,
    name: "Snake Plant",
    category: "Indoor Plants",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    reviews: 215,
    isNew: false,
    discount: 0,
    isWishlisted: false,
    popularity: 92,
    added: "2023-01-20",
    description:
      "The Snake Plant is one of the most tolerant houseplants you can find. It's perfect for beginners and can survive in almost any condition.",
    features: ["Air Purifying", "Low Light", "Drought Tolerant", "Beginner Friendly"],
  },
  {
    id: 4,
    name: "Peace Lily",
    category: "Indoor Plants",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 167,
    isNew: false,
    discount: 0,
    isWishlisted: false,
    popularity: 85,
    added: "2023-02-05",
    description:
      "The Peace Lily is an easy-care plant that produces beautiful white flowers. It's excellent at filtering indoor air pollutants.",
    features: ["Air Purifying", "Low Light", "Flowering"],
  },
]

// Similar products
const similarProducts = [
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    category: "Indoor Plants",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
    reviews: 96,
    isNew: false,
    discount: 10,
    isWishlisted: true,
  },
  {
    id: 3,
    name: "Snake Plant",
    category: "Indoor Plants",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    reviews: 215,
    isNew: false,
    discount: 0,
    isWishlisted: false,
  },
  {
    id: 4,
    name: "Peace Lily",
    category: "Indoor Plants",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 167,
    isNew: false,
    discount: 0,
    isWishlisted: false,
  },
  {
    id: 5,
    name: "Pothos",
    category: "Indoor Plants",
    price: 19.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 203,
    isNew: true,
    discount: 15,
    isWishlisted: false,
  },
]

// Sample reviews
const reviews = [
  {
    name: "Sarah Johnson",
    rating: 5,
    date: "May 15, 2023",
    title: "Beautiful and healthy plant!",
    comment:
      "I received my Monstera in perfect condition. It was well packaged and even bigger than I expected. It's been thriving in my living room and already has new growth. Highly recommend!",
    verified: true,
    helpful: 24,
    images: ["/placeholder.svg?height=100&width=100", "/placeholder.svg?height=100&width=100"],
  },
  {
    name: "Michael Chen",
    rating: 4,
    date: "April 28, 2023",
    title: "Great plant, minor shipping issue",
    comment:
      "The plant itself is beautiful and healthy. One leaf was slightly damaged during shipping, but it doesn't affect the overall health. Customer service was very responsive when I reached out.",
    verified: true,
    helpful: 12,
  },
  {
    name: "Emily Rodriguez",
    rating: 5,
    date: "April 10, 2023",
    title: "Perfect addition to my collection",
    comment:
      "This Monstera is absolutely gorgeous! The leaves are big and healthy, and it came with detailed care instructions. It's already putting out a new leaf after just two weeks.",
    verified: true,
    helpful: 18,
    images: ["/placeholder.svg?height=100&width=100"],
  },
  {
    name: "David Wilson",
    rating: 3,
    date: "March 22, 2023",
    title: "Smaller than expected",
    comment:
      "The plant is healthy but much smaller than I expected based on the photos. I was hoping for a more mature plant given the price. It's growing well though.",
    verified: true,
    helpful: 8,
  },
  {
    name: "Jessica Taylor",
    rating: 5,
    date: "March 15, 2023",
    title: "Exceeded expectations!",
    comment:
      "I'm so impressed with this plant! It arrived in perfect condition and has been thriving in my home. The fenestrations on the leaves are beautiful. Definitely worth the price!",
    verified: true,
    helpful: 15,
  },
  {
    name: "Robert Brown",
    rating: 4,
    date: "February 28, 2023",
    title: "Great plant, slow shipping",
    comment:
      "The Monstera is beautiful and healthy. Shipping took longer than expected, but the plant was well packaged and arrived in good condition. Already seeing new growth!",
    verified: true,
    helpful: 6,
  },
  {
    name: "Amanda Lee",
    rating: 5,
    date: "February 10, 2023",
    title: "Perfect plant for beginners",
    comment:
      "As someone new to plant parenthood, I was nervous about caring for a Monstera. But it's been so easy! The care instructions were clear, and the plant is thriving. Highly recommend!",
    verified: true,
    helpful: 22,
    images: [
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
    ],
  },
]
