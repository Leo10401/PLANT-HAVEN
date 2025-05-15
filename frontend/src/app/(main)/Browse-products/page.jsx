"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { Leaf, Search, Heart, ShoppingBag, X, Filter, ArrowUpDown, Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { CartIcon } from "@/components/ui/CartIcon"

export default function ShopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { addToCart: addToCartContext, items: cartItems } = useCart()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortOption, setSortOption] = useState("popular")
  const [viewMode, setViewMode] = useState("grid")
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get category from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && !activeFilters.includes(categoryParam)) {
      setActiveFilters(prev => [...prev, categoryParam])
    }
  }, [searchParams])

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/prod', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Filter to only show approved products
        const approvedProducts = data.filter(product => product.isApproved === true);
        
        setProducts(approvedProducts);
        setFilteredProducts(approvedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter categories based on backend data
  const filterCategories = [
    {
      name: "Category",
      options: ["indoor", "outdoor", "succulents", "flowering", "trees", "herbs", "rare"],
    }
  ];

  const priceRangeOptions = [
    { label: "Under ₹100", min: 0, max: 100 },
    { label: "₹100-₹250", min: 100, max: 250 },
    { label: "₹250-₹500", min: 250, max: 500 },
    { label: "Over ₹500", min: 500, max: 1000 }
  ];

  // Apply filters
  useEffect(() => {
    let result = [...products]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply category filters
    if (activeFilters.length > 0) {
      result = result.filter((product) => {
        // Check if any of the active filters match this product's category
        return activeFilters.some(
          (filter) => product.category === filter
        )
      })
    }

    // Apply price filter
    result = result.filter((product) => 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1]
    )

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "popular":
        // Since we don't have popularity in backend, we'll sort by newest
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        break
    }

    setFilteredProducts(result)
  }, [searchQuery, activeFilters, priceRange, sortOption, products])

  // Toggle filter
  const toggleFilter = (filter) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([])
    setPriceRange([0, 1000])
    setSearchQuery("")
  }

  // Add to cart function
  const addToCart = async (productId, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart")
      router.push("/Login")
      return
    }

    // If product is already in cart, show notification instead of making API call
    if (isProductInCart(productId)) {
      toast.success("This item is already in your cart")
      return
    }

    try {
      // Find the product details from the products array
      const productToAdd = products.find(product => product._id === productId)
      if (!productToAdd) {
        toast.error("Product not found")
        return
      }

      // Call the context function to add the item to cart
      await addToCartContext({
        productId,
        quantity: 1,
        name: productToAdd.name,
        price: productToAdd.price,
        image: productToAdd.images?.[0] || "/placeholder.svg"
      })
      
      toast.success(`${productToAdd.name} added to cart!`)
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast.error("Failed to add item to cart")
    }
  }

  // Toggle wishlist function
  const toggleWishlist = (productId, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    console.log(`Toggled wishlist for product ${productId}`)
    // Here you would add the actual wishlist functionality
  }

  // Add this function after your other utility functions
  const isProductInCart = (productId) => {
    return cartItems?.some(item => item.productId === productId);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading products</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-green-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
                <img src="/qkartlogo.png" alt="" height={64} width={40} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-4xl font-bold text-green-600">Qkart</span>
                <span className="text-[10px]">Tiny Hands, Green Lands</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search plants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-[300px] rounded-full border-green-200 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors">
              <Heart className="h-5 w-5 text-gray-600" />
            </button>
            <CartIcon />
            <button
              className="md:hidden p-2 rounded-full hover:bg-green-100 transition-colors"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 py-3 bg-white border-b border-green-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-full border-green-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Page title */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop Our Plants</h1>
          <p className="text-white/80 max-w-xl">
            Discover our wide selection of beautiful plants for your home and garden. Use the filters to find the
            perfect plant for your space.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5 text-green-600" />
                  Filters
                </h2>
                {activeFilters.length > 0 && (
                  <button onClick={clearFilters} className="text-xs text-green-600 hover:text-green-700 font-medium">
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter Categories */}
              {filterCategories.map((category, index) => (
                <div key={index} className="mb-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0 last:mb-0">
                  <h3 className="font-medium mb-4">{category.name}</h3>
                  <div className="space-y-2">
                    {category.options.map((option, optionIndex) => (
                      <label 
                        key={optionIndex} 
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => toggleFilter(option)}
                      >
                        <div
                          className={`h-4 w-4 rounded border ${
                            activeFilters.includes(option)
                              ? "bg-green-600 border-green-600"
                              : "border-gray-300 group-hover:border-green-400"
                          } flex items-center justify-center transition-colors`}
                        >
                          {activeFilters.includes(option) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Price Range */}
              <div className="mb-6 border-b border-gray-100 pb-6">
                <h3 className="font-medium mb-4">Price Range</h3>
                <div className="space-y-2">
                  {priceRangeOptions.map((range, index) => (
                    <label 
                      key={index} 
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => setPriceRange([range.min, range.max])}
                    >
                      <div
                        className={`h-4 w-4 rounded border ${
                          priceRange[0] === range.min && priceRange[1] === range.max
                            ? "bg-green-600 border-green-600"
                            : "border-gray-300 group-hover:border-green-400"
                        } flex items-center justify-center transition-colors`}
                      >
                        {priceRange[0] === range.min && priceRange[1] === range.max && 
                          <Check className="h-3 w-3 text-white" />
                        }
                      </div>
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
                
                {/* Keep your existing slider */}
                <div className="mt-4">
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={1}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">₹{priceRange[0]}</span>
                    <span className="text-sm text-gray-600">₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters Sidebar */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 flex md:hidden">
              <div className="ml-auto w-[80%] max-w-sm bg-white h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-lg">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4">
                  {/* Price Range */}
                  <div className="mb-6 border-b border-gray-100 pb-6">
                    <h3 className="font-medium mb-4">Price Range</h3>
                    <div className="space-y-3">
                      {priceRangeOptions.map((range, index) => (
                        <label key={index} className="flex items-center gap-2 cursor-pointer">
                          <div
                            className={`h-5 w-5 rounded border ${
                              priceRange[0] === range.min && priceRange[1] === range.max ? "bg-green-600 border-green-600" : "border-gray-300"
                            } flex items-center justify-center`}
                          >
                            {priceRange[0] === range.min && priceRange[1] === range.max && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filter Categories */}
                  {filterCategories.map((category, index) => (
                    <div key={index} className="mb-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0 last:mb-0">
                      <h3 className="font-medium mb-4">{category.name}</h3>
                      <div className="space-y-3">
                        {category.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center gap-2 cursor-pointer">
                            <div
                              className={`h-5 w-5 rounded border ${
                                activeFilters.includes(option) ? "bg-green-600 border-green-600" : "border-gray-300"
                              } flex items-center justify-center`}
                            >
                              {activeFilters.includes(option) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Active filters */}
                <div className="hidden md:flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 rounded-full px-3 py-1 flex items-center gap-1"
                    >
                      {filter}
                      <button onClick={() => toggleFilter(filter)}>
                        <X className="h-3 w-3 ml-1" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* View mode toggle */}
                <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-green-100 text-green-700" : "bg-white text-gray-500"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-green-100 text-green-700" : "bg-white text-gray-500"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">No plants found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any plants matching your criteria. Try adjusting your filters.
                </p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-green-600 to-emerald-500">
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/product/${product._id}`}
                    key={product._id}
                    className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Image */}
                    <div className="relative h-64 w-full overflow-hidden bg-green-50">
                      <Image
                        src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                        alt={product.name || "Plant"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {product.category || "Uncategorized"}
                      </span>

                      <h3 className="font-medium text-lg mt-2 group-hover:text-green-600 transition-colors">
                        {product.name || "Unnamed Plant"}
                      </h3>

                      <p className="text-gray-600 mt-2 line-clamp-2">{product.description || "No description available"}</p>

                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold text-xl">₹{(product.price || 0).toFixed(2)}</span>
                        
                        {/* Add to cart button removed */}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/shop/${product._id}`}
                    key={product._id}
                    className="group flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-64 md:h-auto md:w-1/3 overflow-hidden bg-green-50">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {product.category}
                      </span>

                      <h3 className="font-medium text-xl group-hover:text-green-600 transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-gray-600 mt-2 mb-4">{product.description}</p>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                        <span className="font-bold text-xl">₹{product.price.toFixed(2)}</span>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="border-green-200 text-green-700 hover:bg-green-50"
                            onClick={(e) => toggleWishlist(product._id, e)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Wishlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 w-10 h-10 p-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 w-10 h-10 p-0"
                  >
                    1
                  </Button>

                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 w-10 h-10 p-0">
                    2
                  </Button>

                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 w-10 h-10 p-0">
                    3
                  </Button>

                  <span className="text-gray-500">...</span>

                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 w-10 h-10 p-0">
                    8
                  </Button>

                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 w-10 h-10 p-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
