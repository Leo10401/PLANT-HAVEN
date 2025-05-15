"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Leaf, 
  Heart, 
  Users, 
  Award, 
  ThumbsUp, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden bg-green-700">
        <Image
          src="/images/nursery-hero.jpg"
          alt="Our nursery"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Growing Green Dreams
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Welcome to Plant Haven, where we nurture nature's gifts with passion and expertise.
            </p>
            <Button className="bg-white text-green-700 hover:bg-green-50">
              Explore Our Story
            </Button>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-green-800">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Plant Haven began with a simple dream: to bring the joy of gardening to every home. Founded in 2010 by Priya and Raj Sharma, our nursery started as a small backyard operation with just 50 plant varieties.
              </p>
              <p>
                What began as a passion project quickly blossomed into a thriving business as people responded to our commitment to quality plants and personalized gardening advice. Today, we're proud to offer over 1,000 plant species and serve thousands of plant enthusiasts across the country.
              </p>
              <p>
                Our journey hasn't always been easy, but our love for plants and dedication to sustainable practices has guided us through every challenge. We believe that every plant has the power to transform spaces and lives, and we're honored to be part of your green journey.
              </p>
            </div>
          </div>
          <div className="md:w-1/2 relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/nursery-founders.jpg"
              alt="Plant Haven Founders"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-green-800">Our Mission & Values</h2>
            <p className="max-w-2xl mx-auto text-gray-700">
              We're committed to bringing nature's beauty to every home while promoting sustainable gardening practices and environmental stewardship.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-800">Sustainability</h3>
              <p className="text-gray-700">
                We prioritize eco-friendly growing methods, biodegradable packaging, and water conservation techniques in everything we do.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-800">Passion</h3>
              <p className="text-gray-700">
                Our team comprises dedicated plant lovers who bring enthusiasm and deep knowledge to help your garden thrive.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-green-800">Community</h3>
              <p className="text-gray-700">
                We believe in building a community of plant enthusiasts through workshops, events, and educational resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-green-600 mb-2">12+</p>
            <p className="text-gray-600">Years of Experience</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600 mb-2">1,000+</p>
            <p className="text-gray-600">Plant Varieties</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600 mb-2">25K+</p>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600 mb-2">15</p>
            <p className="text-gray-600">Expert Gardeners</p>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-green-800">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="h-64 relative">
                <Image
                  src="/images/team-member-1.jpg"
                  alt="Priya Sharma"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-800">Priya Sharma</h3>
                <p className="text-green-600 mb-3">Co-Founder & CEO</p>
                <p className="text-gray-700">
                  With over 20 years of gardening expertise, Priya leads our vision with passion and innovation.
                </p>
              </div>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="h-64 relative">
                <Image
                  src="/images/team-member-2.jpg"
                  alt="Raj Sharma"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-800">Raj Sharma</h3>
                <p className="text-green-600 mb-3">Co-Founder & Operations Head</p>
                <p className="text-gray-700">
                  Raj ensures our nursery runs smoothly while maintaining our commitment to sustainability.
                </p>
              </div>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="h-64 relative">
                <Image
                  src="/images/team-member-3.jpg"
                  alt="Sunita Patel"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-800">Sunita Patel</h3>
                <p className="text-green-600 mb-3">Chief Horticulturist</p>
                <p className="text-gray-700">
                  Sunita brings scientific expertise to our plant cultivation and development programs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-green-800">Why Choose Plant Haven</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Premium Quality Plants</h3>
                  <p className="text-gray-700">Every plant is hand-selected and nurtured with care to ensure it thrives in your home.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Expert Guidance</h3>
                  <p className="text-gray-700">Our team of horticulturists provides personalized advice for your unique gardening needs.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">After-Sale Support</h3>
                  <p className="text-gray-700">We stand behind our plants with care guides and ongoing support to help you succeed.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sustainable Practices</h3>
                  <p className="text-gray-700">From growing to packaging, we make eco-friendly choices to minimize environmental impact.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-4 h-[500px]">
            <div className="rounded-2xl overflow-hidden relative">
              <Image
                src="/images/greenhouse.jpg"
                alt="Our Greenhouse"
                fill
                className="object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden relative">
              <Image
                src="/images/plants-collection.jpg"
                alt="Plant Collection"
                fill
                className="object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden relative col-span-2">
              <Image
                src="/images/gardening.jpg"
                alt="Gardening in action"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Visit Us */}
      <section className="py-16 bg-green-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">Visit Our Nursery</h2>
              <p className="mb-8">
                Come experience the beauty of Plant Haven in person. Our friendly staff is ready to assist you in finding the perfect plants for your space.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-green-300 flex-shrink-0" />
                  <p>123 Green Valley Road, Bangalore, Karnataka, 560001</p>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-green-300 flex-shrink-0" />
                  <p>+91 98765 43210</p>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-green-300 flex-shrink-0" />
                  <p>hello@planthaven.com</p>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="font-semibold mb-2">Working Hours</h3>
                <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                <p>Sunday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
            <div>
              <div className="h-[300px] rounded-xl overflow-hidden relative">
                <Image
                  src="/images/nursery-location.jpg"
                  alt="Our Nursery Location"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-green-800">Ready to Start Your Green Journey?</h2>
        <p className="max-w-2xl mx-auto text-gray-700 mb-8">
          Explore our collection of premium plants and bring nature's beauty into your home.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600">
            Shop Plants Now
          </Button>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}