"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Leaf,
  Search,
  Heart,
  PanelTop,
  Sun,
  Flower2,
  Zap,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CartIcon } from "@/components/ui/CartIcon"

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredCategory, setHoveredCategory] = useState(null)

  // Plant categories with detailed information
  const categories = [
    {
      id: 1,
      name: "Indoor Plants",
      slug: "indoor",
      description: "Perfect for brightening up your home or office space. These plants thrive in indoor environments with minimal care.",
      image: "https://imgs.search.brave.com/Es05zbe3hpptzeLIIPArT6WPY26_zgSsA3CvUUDXIwg/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA0LzIwLzYxLzMw/LzM2MF9GXzQyMDYx/MzAyNV9GTzhlU1Zo/aHNVNno2SnFxMXpx/WWFhSXhFYzNTMVRx/Ni5qcGc",
      icon: <PanelTop className="h-5 w-5 text-white" />,
      color: "from-green-400 to-green-600",
      count: 45
    },
    {
      id: 2,
      name: "Outdoor Plants",
      slug: "outdoor",
      description: "Add beauty and character to your garden or patio with our selection of outdoor plants.",
      image: "https://imgs.search.brave.com/TjtNfqKgP-D_2-7p2XP1kezxk_s9UGs4kDHBX6pqlFI/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9ncmVlbi1wbGFu/dC1wb3RzLWdhcmRl/bi1zdG9jay1waG90/b18xMTc4Ny0xOTk1/LmpwZz9zZW10PWFp/c19oeWJyaWQmdz03/NDA",
      icon: <Sun className="h-5 w-5 text-white" />,
      color: "from-emerald-400 to-emerald-600",
      count: 38
    },
    {
      id: 3,
      name: "Succulents",
      slug: "succulents",
      description: "Low-maintenance plants that store water in their leaves, perfect for beginners and busy people.",
      image: "https://imgs.search.brave.com/h1xMT_3-Nc5Qtz8KfwclZb5nkPt7WEtuQF3dpRV1JyI/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dGhlc3BydWNlLmNv/bS90aG1iLzZjQVRJ/TkJId3dndGl1N2tB/WndlUWRDU3ExMD0v/MTUwMHgwL2ZpbHRl/cnM6bm9fdXBzY2Fs/ZSgpOm1heF9ieXRl/cygxNTAwMDApOnN0/cmlwX2ljYygpL2dy/b3ctZWNoZXZlcmlh/LXN1Y2N1bGVudHMt/MTkwMjk3Ny0wMi1k/ZmM4ZDY4YThkMjU0/NTJhYTc3YTZkNDMy/NzBjNWY5Ni0yOTkx/YjA2NDc1MGU0NDU2/YmRkNDU1YTIyYjg2/NTA3My5qcGc",
      icon: <Leaf className="h-5 w-5 text-white" />,
      color: "from-teal-400 to-teal-600",
      count: 29
    },
    {
      id: 4,
      name: "Flowering Plants",
      slug: "flowering",
      description: "Add vibrant colors and pleasant fragrances to your space with our beautiful flowering plants.",
      image: "https://imgs.search.brave.com/uKsGesC3LLUN-i7XeNrr5aTTpUHpz5dy6IT_KbuQioc/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5hcmNoaXRlY3R1/cmFsZGlnZXN0LmNv/bS9waG90b3MvNjY0/YmE5OGU4NDkwMDgw/ZDBjNjk2MWI5L21h/c3Rlci93XzE2MDAs/Y19saW1pdC9HZXR0/eUltYWdlcy0xNjMz/MDE1ODIuanBn",
      icon: <Flower2 className="h-5 w-5 text-white" />,
      color: "from-pink-400 to-pink-600",
      count: 32
    },
    {
      id: 5,
      name: "Fruit Trees",
      slug: "trees",
      description: "Grow your own fruits with our selection of fruit-bearing trees suitable for various climates.",
      image: "https://imgs.search.brave.com/yaJ_66IDNlETqWs0ohoo8Acs8YbjlsopHtE_66BrH-4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvODU1/MTY1MjQwL3Bob3Rv/L2ZydWl0LXRyZWVz/LWluLWFuLW9yY2hh/cmQtaW4tc3VubGln/aHQtaW4tYXV0dW1u/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1KRV9GUHFaQUlV/SDdLWWRWVTBEMmVS/ZlVLRU1ha2xLTmsx/RVM4Y1VFVXNNPQ",
      icon: <Zap className="h-5 w-5 text-white" />,
      color: "from-orange-400 to-orange-600",
      count: 18
    },
    {
      id: 6,
      name: "Herbs",
      slug: "herbs",
      description: "Fresh culinary and medicinal herbs that you can grow right in your kitchen or garden.",
      image: "https://imgs.search.brave.com/KyvBlv7ux99JvRMu6rFSS_WI38e2Ujo_jzd8qkGcClU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA0Lzc4LzkzLzY1/LzM2MF9GXzQ3ODkz/NjU4OV9iYjZaTHVP/MlN4eHlGcG5SZWY1/Z0ROUU95dVNLSG1T/QS5qcGc",
      icon: <Leaf className="h-5 w-5 text-white" />,
      color: "from-lime-400 to-lime-600",
      count: 22
    },
    {
      id: 7,
      name: "Rare Plants",
      slug: "rare",
      description: "Unique and exotic plants for collectors and enthusiasts looking for something special.",
      image: "https://imgs.search.brave.com/WbJeb_Va-hZ5b1c_QGvuxh-8EfYvuL-RByltNfWONlE/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by9vcm5hbWVudGFs/LXBsYW50cy1qZXdl/bC1vcmNoaWQtbHVk/aXNpYS1kaXNjb2xv/ci1idWRzLXBsYW50/ZWQtY2xheS1wb3Rz/XzQyMTI5LTM5Ny5q/cGc_c2VtdD1haXNf/aHlicmlkJnc9NzQw",
      icon: <Leaf className="h-5 w-5 text-white" />,
      color: "from-purple-400 to-purple-600",
      count: 15
    },
    {
      id: 8,
      name: "Gardening Tools",
      slug: "tools",
      description: "Essential tools and accessories to help you care for your plants and garden.",
      image: "https://imgs.search.brave.com/hP5DGefzUjOU_fJXBF3gDaoo3CGNxZ1gYqgudgHq64A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAwLzg4LzU0Lzgz/LzM2MF9GXzg4NTQ4/MzQ4X0Q5QnFYdFUw/bDNwTmo5enZWQjl3/RENvZ0RKNlhYYmth/LmpwZw",
      icon: <Zap className="h-5 w-5 text-white" />,
      color: "from-blue-400 to-blue-600",
      count: 27
    }
  ]

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : categories

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

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
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
          </div>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 py-3 bg-white border-b border-green-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-full border-green-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16 md:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[10%] right-[5%] w-32 md:w-64 h-32 md:h-64 rounded-full bg-white/10 blur-3xl"
          ></div>
          <div
            className="absolute bottom-[20%] left-[10%] w-20 md:w-40 h-20 md:h-40 rounded-full bg-white/10 blur-3xl"
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Plant Categories</h1>
            <p className="text-lg md:text-xl text-white/80">
              Explore our diverse collection of plants organized by category to find the perfect addition to your space.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredCategories.map((category) => (
              <Link
                href={`/Browse-products?category=${category.slug}`}
                key={category.id}
                className="group relative h-72 sm:h-80 overflow-hidden rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Category Info */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 z-20">
                  <div className={`bg-gradient-to-r ${category.color} p-3 rounded-xl inline-block mb-3 shadow-lg transform transition-transform duration-300 group-hover:translate-y-[-5px]`}>
                    {category.icon}
                  </div>

                  <h3 className="text-white text-xl sm:text-2xl font-bold mb-2 transform transition-transform duration-300 group-hover:translate-y-[-5px]">
                    {category.name}
                    <span className="text-sm font-normal ml-2 text-white/70">({category.count})</span>
                  </h3>

                  <p className="text-white/80 text-sm mb-4 line-clamp-2 transform transition-transform duration-300 group-hover:translate-y-[-5px]">
                    {category.description}
                  </p>

                  <span className="inline-flex items-center text-sm text-white/80 group-hover:text-white transition-colors duration-300">
                    Explore Category
                    <ArrowRight className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any categories matching your search. Try a different search term.
            </p>
            <Button
              onClick={() => setSearchQuery("")}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* Plant Care Tips Section */}
      <div className="bg-green-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Plant Care Tips by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Different plant categories require different care. Browse our categories to learn specific care tips for each type of plant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all-300 hover-lift">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
                <PanelTop className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Indoor Plants</h3>
              <p className="text-gray-600 mb-4">Most indoor plants prefer bright, indirect light and moderate watering. Keep humidity levels balanced.</p>
              <Link
                href="/Browse-products?category=indoor"
                className="text-green-600 font-medium flex items-center hover:text-green-700"
              >
                Learn more
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all-300 hover-lift">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Outdoor Plants</h3>
              <p className="text-gray-600 mb-4">Outdoor plants typically need more direct sunlight and regular watering, especially during hot seasons.</p>
              <Link
                href="/Browse-products?category=outdoor"
                className="text-green-600 font-medium flex items-center hover:text-green-700"
              >
                Learn more
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all-300 hover-lift">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Succulents</h3>
              <p className="text-gray-600 mb-4">Succulents need infrequent watering and plenty of light. Let the soil dry completely between waterings.</p>
              <Link
                href="/Browse-products?category=succulents"
                className="text-green-600 font-medium flex items-center hover:text-green-700"
              >
                Learn more
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all-300 hover-lift">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center mb-4">
                <Flower2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">Flowering Plants</h3>
              <p className="text-gray-600 mb-4">Flowering plants often need more fertilizer and consistent moisture to produce beautiful blooms.</p>
              <Link
                href="/Browse-products?category=flowering"
                className="text-green-600 font-medium flex items-center hover:text-green-700"
              >
                Learn more
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Get Plant Care Tips by Category</h2>
            <p className="text-gray-600">
              Subscribe to our newsletter to receive care tips specific to your favorite plant categories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="rounded-full px-4 py-4 border-green-200 focus:border-green-500 focus:ring-green-500 flex-1"
            />
            <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-full px-6 py-4">
              Subscribe
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-green-100">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Qkart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 