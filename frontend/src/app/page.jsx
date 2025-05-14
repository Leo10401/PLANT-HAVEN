"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Truck,
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Sun,
  Droplets,
  Wind,
  Sprout,
  Flower2,
  PanelTop,
  Zap,
  ChevronRight,
  ChevronLeft,
  Filter,
  User,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimationController } from "./transitions"
import { CustomCursor, MagneticElement, LeafDecorations } from "./cursor"
import "./animations.css"
import { useSearchParams } from "next/navigation"
import toast from "react-hot-toast"
import { useAuth } from "@/context/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {
  // Apply staggered animations to various elements
  const featuredProductRef = useRef(null)
  const categoryItemRef = useRef(null)
  const benefitItemRef = useRef(null)
  const navItemRef = useRef(null)
  const shopNowBtnRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const magneticRef = useRef(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const searchParams = useSearchParams()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'unauthorized') {
      toast.error('You are not authorized to access this page')
    }
  }, [searchParams])

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Use magnetic effect on the shop now button (only on desktop)
  useEffect(() => {
    if (!isMobile && shopNowBtnRef.current) {
      // Remove the useMagneticEffect call since we'll use the component instead
    }
  }, [isMobile])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Add prefers-reduced-motion check
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Optimize intersection observer
  useEffect(() => {
    if (prefersReducedMotion) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(".staggered-item")
            elements.forEach((element, index) => {
              const delay = prefersReducedMotion ? 0 : Number.parseInt(element.dataset.delay || "100", 10)
              element.style.transitionDelay = `${index * delay}ms`
              element.classList.add("animate-visible")
            })
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      },
    )

    const refs = [
      { ref: featuredProductRef, selector: '.featured-product', delay: 100 },
      { ref: categoryItemRef, selector: '.category-item', delay: 150 },
      { ref: benefitItemRef, selector: '.benefit-item', delay: 200 },
      { ref: navItemRef, selector: '.nav-item', delay: 50 }
    ]

    refs.forEach(({ ref, selector, delay }) => {
      if (ref.current) {
        const elements = ref.current.querySelectorAll(selector)
        elements.forEach((element) => {
          element.classList.add("staggered-item")
          element.dataset.delay = delay
        })
        observer.observe(ref.current)
      }
    })

    return () => observer.disconnect()
  }, [prefersReducedMotion])

  // Testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Interior Designer",
      image: "/placeholder.svg?height=100&width=100",
      quote: "The plants I ordered arrived in perfect condition. They've transformed my living space completely!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Home Gardener",
      image: "/placeholder.svg?height=100&width=100",
      quote:
        "Exceptional quality and customer service. My fiddle leaf fig is thriving and the care guide was very helpful.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Plant Enthusiast",
      image: "/placeholder.svg?height=100&width=100",
      quote: "I'm impressed with how carefully the plants were packaged. Will definitely be ordering more soon!",
      rating: 4,
    },
  ]

  return (
    <AnimationController>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white overflow-hidden">
        {/* Only show custom cursor on non-mobile devices and when reduced motion is not preferred */}
        {!isMobile && !prefersReducedMotion && <CustomCursor />}
        {!isMobile && !prefersReducedMotion && <LeafDecorations />}

        {/* Mobile Menu - Improved accessibility */}
        <div
          className={`fixed inset-0 bg-white z-50 transition-all duration-500 ${
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="container mx-auto px-4 py-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full animate-pulse-slow">
                  <img src="/qkartlogo.png" alt="" height={64} width={40} />
                </div>
                <span className="text-xl font-bold gradient-text">Qkart</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-green-100 transition-all-300 touch-larger-hit"
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-gray-600" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center" aria-label="Main navigation">
              {[
                { name: "Home", href: "/" },
                { name: "Shop", href: "/Browse-products" },
                { name: "Categories", href: "/Categories" },
                { name: "About", href: "/About" },
                { name: "Contact", href: "/Contact" }
              ].map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-2xl md:text-3xl font-bold py-4 relative group animated-underline touch-larger-hit"
                  style={{
                    transitionDelay: prefersReducedMotion ? 0 : `${index * 50}ms`,
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto">
              <div className="flex gap-4 justify-center" role="list" aria-label="Social media links">
                {["facebook", "twitter", "instagram", "pinterest"].map((social, index) => (
                  <a
                    key={social}
                    href="#"
                    className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all-300 hover-scale touch-larger-hit"
                    style={{
                      transitionDelay: prefersReducedMotion ? 0 : `${index * 50}ms`,
                      opacity: isMenuOpen ? 1 : 0,
                      transform: isMenuOpen ? "translateY(0)" : "translateY(20px)",
                      transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    aria-label={`Visit our ${social} page`}
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Header with glass effect - Improved performance */}
        <header
          className={`sticky top-0 z-40 transition-all duration-300 ${
            scrollY > 50 ? "backdrop-blur-md bg-white/70 border-b border-green-100 py-3" : "bg-transparent py-5"
          }`}
          style={{
            willChange: 'transform, opacity',
            transform: `translateZ(0)`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="bg-gradient-to-br from-green-400 to-emerald-200 p-2 rounded-full animate-pulse-slow organic-shape-1">
                <img src="/qkartlogo.png" alt="" height={64} width={40} />
              </div>
              <span className="text-lg sm:text-xl font-bold gradient-text">Qkart</span>
            </div>

            <nav className="hidden md:flex gap-8" ref={navItemRef} aria-label="Main navigation">
              {[
                { name: "Home", href: "/" },
                { name: "Shop", href: "/Browse-products" },
                { name: "Categories", href: "/Categories" },
                { name: "About", href: "/About" },
                { name: "Contact", href: "/Contact" }
              ].map((item, index) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="text-sm font-medium relative group nav-item animated-underline"
                  style={{
                    transitionDelay: prefersReducedMotion ? 0 : `${index * 50}ms`,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4 animate-fade-in">
              <button className="p-2 rounded-full hover:bg-green-100 transition-all-300 hover-scale touch-larger-hit">
                <Search className="h-5 w-5 text-gray-600" />
              </button>
              <button className="hidden sm:flex p-2 rounded-full hover:bg-green-100 transition-all-300 hover-scale touch-larger-hit">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
              <Link href="/user/cart" className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-all-300 hover-scale relative touch-larger-hit">
                <ShoppingBag className="h-5 w-5 text-green-600" />
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse-slow">
                  0
                </span>
              </Link>

              {isAuthenticated() ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full hover:bg-green-100 transition-all-300 hover-scale touch-larger-hit">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.name || "User"} />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/identify">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-all-300 hover-scale">
                    Sign In
                  </Button>
                </Link>
              )}

              <button
                className="md:hidden p-2 rounded-full hover:bg-green-100 transition-all-300 hover-scale touch-larger-hit"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section with creative layout */}
          <section className="relative overflow-hidden min-h-[80vh] md:min-h-[90vh] flex items-center py-10 md:py-0">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-[10%] right-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-green-100/50 blur-3xl"
                style={{ transform: `translateY(${scrollY * 0.2}px)` }}
              ></div>
              <div
                className="absolute bottom-[20%] left-[10%] w-20 md:w-40 h-20 md:h-40 rounded-full bg-emerald-100/50 blur-3xl"
                style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
              ></div>
              <div
                className="absolute top-[40%] left-[20%] w-12 md:w-24 h-12 md:h-24 rounded-full bg-green-200/30 blur-xl"
                style={{ transform: `translateY(${scrollY * 0.15}px)` }}
              ></div>
            </div>

            <div className="container mx-auto px-4 py-10 md:py-20 flex flex-col md:flex-row items-center relative z-10">
              <div className="w-full md:w-1/2 space-y-6 md:space-y-8 md:pr-12 reveal-on-scroll text-center md:text-left">
                <div className="inline-block px-4 py-1 rounded-full glass-effect text-green-800 text-xs sm:text-sm font-medium mb-2 animate-pulse-slow">
                  🌱 Eco-friendly & Sustainable
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-slide-up">
                  Bring <span className="gradient-text">Nature's Beauty</span> Into Your Home
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto md:mx-0 animate-slide-up delay-200">
                  Discover our curated collection of premium plants and trees to transform your space into a lush
                  paradise.
                </p>
                <div className="flex flex-wrap gap-4 pt-4 animate-slide-up delay-300 justify-center md:justify-start">
                  <MagneticElement strength={20}>
                    <Button
                      ref={shopNowBtnRef}
                      className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-6 sm:px-8 py-5 sm:py-6 shadow-lg shadow-green-200 transition-all-500 hover:shadow-xl hover:shadow-green-300 button-hover-effect magnetic-button touch-larger-hit touch-active"
                      style={{
                        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                      }}
                    >
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform-300 group-hover:translate-x-1" />
                    </Button>
                  </MagneticElement>
                  <Button
                    variant="outline"
                    className="border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-full px-6 sm:px-8 py-5 sm:py-6 transition-all-300 button-hover-effect touch-larger-hit touch-active"
                    style={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    Explore Categories
                  </Button>
                </div>

                <div className="flex items-center gap-4 pt-6 justify-center md:justify-start">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-green-100 overflow-hidden"
                        style={{ zIndex: 5 - i }}
                      >
                        <Image
                          src={`/placeholder.svg?height=50&width=50`}
                          alt={`Customer ${i}`}
                          width={32}
                          height={32}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">From 2,000+ happy customers</p>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 mt-12 md:mt-0 relative reveal-on-scroll">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-green-100 rounded-full blur-xl animate-pulse-slow"></div>
                <div
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-xl animate-pulse-slow"
                  style={{ animationDelay: "1s" }}
                ></div>

                <div className="relative h-[300px] sm:h-[400px] w-full md:h-[500px] rounded-[20px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-green-200/50 transform md:rotate-3 transition-transform-500 hover:rotate-0 duration-500 tilt-effect organic-shape-1"
                  style={{
                    transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <Image
                    src="/young.webp"
                    alt="Beautiful plants and trees"
                    fill
                    className="object-contain transition-transform-500 hover-scale "
                    style={{
                      transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl max-w-[180px] sm:max-w-[200px] animate-float hidden sm:block animate-expand glass-effect">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-5 w-5 text-green-600" />
                    <p className="text-xs sm:text-sm font-medium">Free shipping on orders over ₹50</p>
                  </div>
                </div>

                <div
                  className="absolute top-10 right-0 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg animate-float-alt hidden sm:block animate-expand glass-effect"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 p-1 sm:p-2 rounded-full organic-shape-1">
                      <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <p className="text-xs font-medium">Quality Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="scroll-indicator hidden md:block"></div>
          </section>

          {/* Plant Care Tips Section */}
          <section className="py-12 md:py-20 container mx-auto px-4 reveal-on-scroll">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-green-600 font-medium">Plant Care</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 gradient-text">
                Essential Care Tips
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Keep your plants thriving with these essential care tips from our plant experts
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[
                {
                  icon: <Sun className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />,
                  title: "Light",
                  description:
                    "Most plants need bright, indirect sunlight to thrive. Avoid direct sunlight which can burn leaves.",
                },
                {
                  icon: <Droplets className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />,
                  title: "Water",
                  description:
                    "Water thoroughly when the top inch of soil feels dry. Ensure proper drainage to prevent root rot.",
                },
                {
                  icon: <Wind className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />,
                  title: "Air",
                  description:
                    "Good air circulation helps prevent pests and diseases. Avoid placing plants in drafty areas.",
                },
                {
                  icon: <Sprout className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />,
                  title: "Soil",
                  description:
                    "Use high-quality potting mix appropriate for your plant type. Repot when roots outgrow the container.",
                },
              ].map((tip, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all-300 hover-lift card-3d"
                >
                  <div className="card-3d-content">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center mb-4 sm:mb-6">
                      {tip.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{tip.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Products with creative cards */}
          <section className="py-12 md:py-20 container mx-auto px-4 reveal-on-scroll" ref={featuredProductRef}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 animate-slide-up">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <span className="text-green-600 font-medium">Our Selection</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1 gradient-text">Featured Plants</h2>
              </div>

              {/* Mobile filter button */}
              <div className="md:hidden flex justify-center mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>

              {/* Desktop category filters */}
              <div
                className={`mt-4 md:mt-0 flex gap-2 overflow-x-auto pb-2 md:pb-0 ${showFilters || !isMobile ? "flex" : "hidden"}`}
              >
                {["All", "Indoor", "Outdoor", "Succulents", "Herbs"].map((category, index) => (
                  <button
                    key={category}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all-300 touch-larger-hit ${
                      activeCategory === index
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                    onClick={() => {
                      setActiveCategory(index)
                      if (isMobile) setShowFilters(false)
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all-500 hover-lift featured-product card-hover-effect reveal-on-scroll card-3d"
                >
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                    <button className="p-1.5 sm:p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors-300 animate-fade-in touch-larger-hit">
                      <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 group-hover:text-red-500 transition-colors-300" />
                    </button>
                  </div>

                  {product.tag && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        {product.tag}
                      </span>
                    </div>
                  )}

                  <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-green-50 image-hover-zoom">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform-500"
                    />
                  </div>

                  <div className="p-4 sm:p-6 card-3d-content">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full animate-fade-in">
                        {product.category}
                      </span>
                      <div className="flex items-center">
                        <span className="text-xs text-yellow-500 mr-1">★</span>
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-medium text-base sm:text-lg mt-2 group-hover:text-green-600 transition-colors-300">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center mt-3 sm:mt-4">
                      <div>
                        <p className="font-bold text-lg sm:text-xl">₹{product.price}</p>
                        {product.oldPrice && (
                          <p className="text-xs sm:text-sm text-gray-400 line-through">₹{product.oldPrice}</p>
                        )}
                      </div>
                      <button className="p-2 sm:p-3 bg-green-100 rounded-full text-green-600 hover:bg-green-600 hover:text-white transition-all-300 hover-scale touch-larger-hit">
                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 text-center">
              <Button className="bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-full px-6 sm:px-8 py-5 sm:py-6 transition-all-300 button-hover-effect touch-larger-hit touch-active">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 transition-transform-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </section>

          {/* Categories with creative layout */}
          <section className="py-12 md:py-20 relative overflow-hidden reveal-on-scroll" ref={categoryItemRef}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 -z-10"></div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-20 sm:w-40 h-20 sm:h-40 bg-green-100/50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-30 sm:w-60 h-30 sm:h-60 bg-emerald-100/50 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-10 md:mb-16">
                <span className="text-green-600 font-medium">Collections</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 gradient-text">
                  Shop by Category
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                  Find the perfect plants for every space in your home or garden
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((category, index) => (
                  <Link
                    href="#"
                    key={category.id}
                    className="group relative h-60 sm:h-80 overflow-hidden rounded-2xl sm:rounded-3xl category-item tilt-effect reveal-on-scroll spotlight"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 z-20">
                      <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl inline-block mb-2 glass-effect">
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="text-white text-xl sm:text-2xl font-bold mb-1 sm:mb-2 transition-transform-300 group-hover:translate-y-[-5px]">
                        {category.name}
                      </h3>
                      <span className="inline-flex items-center text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors-300">
                        Explore
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transform transition-transform-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section - Mobile Swipeable */}
          <section className="py-12 md:py-20 container mx-auto px-4 reveal-on-scroll">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-green-600 font-medium">Testimonials</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 gradient-text">
                What Our Customers Say
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Hear from our happy customers about their experience with Qkart
              </p>
            </div>

            {/* Desktop testimonials */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all-300 hover-lift relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-3xl -z-10"></div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>

                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-500" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile testimonial carousel */}
            <div className="md:hidden">
              <div className="bg-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-2xl -z-10"></div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonials[currentTestimonial].image || "/placeholder.svg"}
                      alt={testimonials[currentTestimonial].name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-xs text-gray-600">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 text-sm">"{testimonials[currentTestimonial].quote}"</p>

                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < testimonials[currentTestimonial].rating ? "text-yellow-500" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Navigation dots */}
                <div className="flex justify-center mt-6 gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full ${
                        currentTestimonial === index ? "bg-green-600" : "bg-gray-300"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation arrows */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2">
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                    className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md touch-larger-hit"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setCurrentTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                    className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-md touch-larger-hit"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits with creative design */}
          <section className="py-12 md:py-20 container mx-auto px-4 reveal-on-scroll" ref={benefitItemRef}>
            <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16 animate-slide-up">
              <span className="text-green-600 font-medium">Our Promise</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 gradient-text">
                Why Choose Qkart
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                We're committed to providing the highest quality plants and exceptional service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {[
                {
                  icon: <Leaf className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
                  title: "Premium Quality",
                  description:
                    "All our plants are carefully selected and nurtured to ensure they thrive in your home or garden.",
                },
                {
                  icon: <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
                  title: "Fast Delivery",
                  description:
                    "We ensure quick and safe delivery of your plants with our specialized packaging methods.",
                },
                {
                  icon: <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />,
                  title: "30-Day Guarantee",
                  description: "If your plant doesn't thrive within 30 days, we'll replace it free of charge.",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all-500 hover-lift overflow-hidden group benefit-item card-hover-effect reveal-on-scroll"
                >
                  <div className="absolute top-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-br-[30px] sm:rounded-br-[40px] -translate-x-6 sm:-translate-x-8 -translate-y-6 sm:-translate-y-8 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform-500"></div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-green-200 transition-transform-300 group-hover:scale-110 animate-pulse-slow">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 transition-colors-300 group-hover:text-green-600">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 transition-opacity-300 text-sm sm:text-base">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Instagram Feed Section - Responsive Grid */}
          <section className="py-12 md:py-20 container mx-auto px-4 reveal-on-scroll">
            <div className="text-center mb-8 md:mb-12">
              <span className="text-green-600 font-medium">Instagram</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 gradient-text">
                Follow Us @Qkart
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Get inspired by our plant styling ideas and join our community of plant lovers
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <a
                  href="#"
                  key={index}
                  className="relative group overflow-hidden rounded-lg sm:rounded-xl aspect-square spotlight"
                >
                  <Image
                    src={`/placeholder.svg?height=300&width=300`}
                    alt={`Instagram post ${index + 1}`}
                    fill
                    className="object-cover transition-transform-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-6 sm:mt-10 text-center">
              <a
                href="#"
                className="inline-flex items-center text-green-600 font-medium hover:text-green-700 animated-underline text-sm sm:text-base"
              >
                View More on Instagram
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </div>
          </section>

          {/* Newsletter with creative design */}
          <section className="py-12 md:py-20 relative overflow-hidden reveal-on-scroll">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-500 -z-10"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-10 sm:h-20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="absolute top-0 left-0 w-full h-10 sm:h-20"
              >
                <path
                  d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                  opacity=".25"
                  fill="%2310b981"
                ></path>
              </svg>
            </div>

            <div
              className="absolute top-0 right-0 w-1/3 h-full bg-white/10 -skew-x-12 -z-10 parallax-scroll"
              data-speed="0.1"
            ></div>
            <div
              className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-white/10 skew-x-12 -z-10 parallax-scroll"
              data-speed="-0.1"
            ></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl animate-fade-in tilt-effect organic-shape-1">
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block p-2 sm:p-3 bg-green-100 rounded-full mb-3 sm:mb-4 animate-pulse-slow organic-shape-2">
                    <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 animate-slide-up gradient-text">
                    Join Our Green Community
                  </h2>
                  <p className="text-gray-600 animate-slide-up delay-100 text-sm sm:text-base">
                    Subscribe to receive gardening tips, exclusive offers, and updates on new plant arrivals.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 animate-slide-up delay-200">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-full px-4 sm:px-6 py-4 sm:py-6 border-green-200 focus:border-green-500 focus:ring-green-500 transition-all-300"
                  />
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-6 sm:px-8 py-4 sm:py-6 shadow-lg shadow-green-200/50 transition-all-500 hover:shadow-xl button-hover-effect touch-larger-hit">
                    Subscribe
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4 animate-fade-in delay-300">
                  By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer with creative design */}
        <footer className="bg-white pt-12 sm:pt-20 pb-8 sm:pb-10 border-t border-green-100 relative">
          <div className="absolute top-0 left-0 w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="w-full h-6 sm:h-12 rotate-180"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                fill="#f0fdf4"
              ></path>
            </svg>
          </div>

          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              <div className="reveal-on-scroll text-center sm:text-left">
                <div className="flex items-center gap-2 mb-4 sm:mb-6 justify-center sm:justify-start">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-1.5 sm:p-2 rounded-full animate-pulse-slow organic-shape-1">
                    <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold gradient-text">Qkart</span>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Your one-stop shop for premium plants, trees, and gardening supplies.
                </p>
                <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start">
                  {["facebook", "twitter", "instagram", "pinterest"].map((social, index) => (
                    <a
                      key={social}
                      href="#"
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all-300 hover-scale animate-fade-in touch-larger-hit"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="sr-only">{social}</span>
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {[
                {
                  title: "Quick Links",
                  links: ["Home", "Shop", "About Us", "Contact"],
                },
                {
                  title: "Customer Service",
                  links: ["Shipping Policy", "Returns & Refunds", "FAQs", "Plant Care Guides"],
                },
                {
                  title: "Contact Us",
                  content: [
                    "123 Garden Street",
                    "Greenville, GR 12345",
                    "Email: info@qkart.com",
                    "Phone: (123) 456-7890",
                  ],
                },
              ].map((column, index) => (
                <div
                  key={index}
                  className="reveal-on-scroll text-center sm:text-left"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6 animate-slide-up">{column.title}</h3>
                  {column.links ? (
                    <ul className="space-y-3 sm:space-y-4">
                      {column.links.map((link, linkIndex) => (
                        <li
                          key={link}
                          className="animate-slide-right"
                          style={{ animationDelay: `${linkIndex * 100}ms` }}
                        >
                          <Link
                            href="#"
                            className="text-gray-600 hover:text-green-600 transition-colors-300 animated-underline inline-block text-sm sm:text-base touch-larger-hit"
                          >
                            {link}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <address className="not-italic text-gray-600 space-y-3 sm:space-y-4 text-sm sm:text-base">
                      {column.content?.map((line, lineIndex) => (
                        <p
                          key={line}
                          className="animate-slide-right"
                          style={{ animationDelay: `${lineIndex * 100}ms` }}
                        >
                          {line}
                        </p>
                      ))}
                    </address>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-green-100 text-center text-gray-500 text-xs sm:text-sm animate-fade-in">
              <p>© {new Date().getFullYear()} Qkart. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </AnimationController>
  )
}

// Helper function to get category icon
function getCategoryIcon(categoryName) {
  switch (categoryName) {
    case "Indoor Plants":
      return <PanelTop className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
    case "Outdoor Plants":
      return <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
    case "Fruit Trees":
      return <Flower2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
    case "Gardening Tools":
      return <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
    default:
      return <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
  }
}

// Sample data
const featuredProducts = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    category: "Indoor Plants",
    price: 39.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: "4.9",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    category: "Indoor Plants",
    price: 49.99,
    oldPrice: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: "4.7",
  },
  {
    id: 3,
    name: "Snake Plant",
    category: "Indoor Plants",
    price: 29.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: "4.8",
    tag: "New",
  },
  {
    id: 4,
    name: "Peace Lily",
    category: "Indoor Plants",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: "4.6",
  },
]

const categories = [
  {
    id: 1,
    name: "Indoor Plants",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "Outdoor Plants",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    name: "Fruit Trees",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    name: "Gardening Tools",
    image: "/placeholder.svg?height=300&width=300",
  },
]
