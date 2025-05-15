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
  Plus,
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
import { CartIcon } from "@/components/ui/CartIcon"
import { useRouter } from "next/navigation"

export default function Home() {
  // Apply staggered animations to various elements
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
  const router = useRouter()
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false)
  const avatarDropdownRef = useRef(null)

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

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(event.target)) {
        setIsAvatarDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Interior Designer",
      image: "/placeholder-user.jpg",
      quote: "The plants I ordered arrived in perfect condition. They've transformed my living space completely!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Home Gardener",
      image: "/placeholder-user.jpg",
      quote:
        "Exceptional quality and customer service. My fiddle leaf fig is thriving and the care guide was very helpful.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Plant Enthusiast",
      image: "/placeholder-user.jpg",
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
          className={`fixed inset-0 bg-white z-50 transition-all duration-500 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="container mx-auto px-4 py-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
                  <img src="/qkartlogo.png" alt="" height={64} width={40} />
                </div>
                <span className="text-xl font-bold text-green-600">Qkart</span>
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
          className={`sticky top-0 z-40 transition-all duration-300 ${scrollY > 50 ? "backdrop-blur-md bg-white/70 border-b border-green-100 py-3" : "bg-transparent py-5"
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
              <div className="flex flex-col">

                <span className="text-lg sm:text-4xl font-bold text-green-600">Qkart</span>
                <span className="text-[10px]">Tiny Hands, Green Lands</span>
              </div>
            </div>

            <nav className="hidden md:flex gap-8" ref={navItemRef} aria-label="Main navigation">
              {[
                { name: "Home", href: "/" },
                { name: "Shop", href: "/Browse-products" },
                { name: "Categories", href: "/Categories" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" }
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
              <CartIcon className="transition-all-300 hover-scale touch-larger-hit" />

              {isAuthenticated() ? (
                <div className="relative" ref={avatarDropdownRef}>
                  <button
                    onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
                    className="flex items-center gap-2 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                    aria-expanded={isAvatarDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                  </button>
                  <div
                    className={`absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ${isAvatarDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                      }`}
                  >
                    <Link
                      href="/user/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/user/all-orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <span className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
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
                <div className="inline-block px-4 py-1 rounded-full glass-effect text-green-800 text-xs sm:text-sm font-medium mb-2">
                  🌱 Eco-friendly & Sustainable
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Bring <span className="text-green-600">Nature's Beauty</span> Into Your Home
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto md:mx-0 delay-200">
                  Discover our curated collection of premium plants and trees to transform your space into a lush
                  paradise.
                </p>
                <div className="flex flex-wrap gap-4 pt-4 animate-slide-up delay-300 justify-center md:justify-start">
                  <Button
                    ref={shopNowBtnRef}
                    onClick={() => router.push('/Browse-products')}
                    className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-6 sm:px-8 py-5 sm:py-6 shadow-lg shadow-green-200 transition-all-500 hover:shadow-xl hover:shadow-green-300"
                    style={{
                      transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform-300 group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/Categories')}
                    className="border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-full px-6 sm:px-8 py-5 sm:py-6 transition-all-300 button-hover-effect touch-larger-hit touch-active"
                    style={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                  >
                    Explore Categories
                  </Button>
                </div>

              </div>
              <div className="w-full md:w-1/2 mt-12 md:mt-0 relative reveal-on-scroll">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-green-100 rounded-full blur-xl animate-pulse-slow"></div>
                <div
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-100 rounded-full blur-xl animate-pulse-slow"
                  style={{ animationDelay: "1s" }}
                ></div>


                <img className="w-full" src="https://static.vecteezy.com/system/resources/thumbnails/056/680/936/small_2x/indoor-garden-display-with-various-lush-plants-png.png" alt="" />


              </div>
            </div>

          </section>

          {/* Plant Care Tips Section */}
          <section className="py-12 md:py-20 container mx-auto px-4 reveal-on-scroll">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-green-600 font-medium">Plant Care</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 text-green-600">
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

          {/* Categories with creative layout */}
          <section className="py-12 md:py-20 relative overflow-hidden reveal-on-scroll" ref={categoryItemRef}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 -z-10"></div>

            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-20 sm:w-40 h-20 sm:h-40 bg-green-100/50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-30 sm:w-60 h-30 sm:h-60 bg-emerald-100/50 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-10 md:mb-16">
                <span className="text-green-600 font-medium">Collections</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 text-green-600">
                  Shop by Category
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                  Find the perfect plants for every space in your home or garden
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((category, index) => (
                  <Link
                    href={`/Browse-products?category=${category.name.toLowerCase().replace(' ', '-')}`}
                    key={category.id}
                    className="group relative h-60 sm:h-80 overflow-hidden rounded-2xl sm:rounded-3xl category-item tilt-effect reveal-on-scroll spotlight"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                    <Image
                      src={category.image || "/placeholder.jpg"}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full transition-transform-500 group-hover:scale-110"
                      priority={index < 2}
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

              <div className="text-center mt-8">
                <Link href="/(main)/Categories">
                  <Button className="bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-full px-6 sm:px-8 py-5 sm:py-6 transition-all-300 button-hover-effect touch-larger-hit touch-active">
                    View All Categories
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Testimonials Section - Mobile Swipeable */}
          <section className="py-12 md:py-20 container mx-auto px-4 reveal-on-scroll">
            <div className="text-center mb-10 md:mb-16">
              <span className="text-green-600 font-medium">Testimonials</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 text-green-600">
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
                      className={`w-2 h-2 rounded-full ${currentTestimonial === index ? "bg-green-600" : "bg-gray-300"
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 mb-3 md:mb-4 text-green-600">
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
              <div className="max-w-xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl animate-fade-in">
                <div className="text-center mb-6 sm:mb-8">
                  <span className="inline-block p-2 sm:p-3 bg-green-100 rounded-full mb-3 sm:mb-4 animate-pulse-slow organic-shape-2">
                    <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 animate-slide-up text-green-600">
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
                  <span className="text-lg sm:text-xl font-bold text-green-600">Qkart</span>
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
const categories = [
  {
    id: 1,
    name: "Indoor",
    image: "https://imgs.search.brave.com/7D6Kbftdu6GMclxmW68UoowJ59FmVcu7AizABnWAxCA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTI5/MzUwOTY2Mi9waG90/by9pbmRvb3ItZ2Fy/ZGVuaW5nLWhvdXNl/LXBsYW50cy5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9RWxZ/Nl9PQXR6MEowdUVK/UXduMUduUjVWN3lJ/Q09QR0hUdXZ0UTEw/alJZcz0",
  },
  {
    id: 2,
    name: "Outdoor",
    image: "https://imgs.search.brave.com/-WV-mTk_3_fY9Y2-o0lTJPHS64pYpm_S2XN8Cy9yCSk/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTA4/MzE1NTE0OC9waG90/by9jb2xsZWN0aW9u/LW9mLWhvdXNlcGxh/bnQuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPVZablU0aFlr/NmhWWm1XZVd3OU9q/NVlHSkV5MmhGc3hU/MlpjS3NPU3BxT0U9",
  },
  {
    id: 3,
    name: "Fruit Trees",
    image: "https://imgs.search.brave.com/LOkmufJtMQteN4lRyh1KVHjr589NxPJdytIg972qFNA/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTA1/NzQ3NjE5OC9waG90/by9hcHBsZS1vcmNo/YXJkLXdpdGgtdHJl/ZXMtbG9hZGVkLXdp/dGgtcmlwZS1hcHBs/ZXMuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPUlyUHAwSUxq/WXBOeUJ5eWJUbkxp/ZGVNTjMxRHVjS2dL/OFF4SFA5QlluVVk9",
  },
  {
    id: 4,
    name: "Gardening Tools",
    image: "https://imgs.search.brave.com/HSAdOXUfGYOxBQ8RnE3ca_Muhb6GdI-CBEK3cXxGbd4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvNTM5/OTUzMTQ5L3Bob3Rv/L2dhcmRlbi10b29s/cy1vbi13b29kLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz1V/SHYycEpxa01xSXVH/bWRLek5LNThEbDht/Rkd5OVVLYzBNT1VG/dDlEODVzPQ",
  },
]
