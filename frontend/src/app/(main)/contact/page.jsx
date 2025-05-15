"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Here you would normally send the data to your API
    // For now, we'll simulate a successful submission
    setFormStatus('success');
    
    // Reset form after successful submission
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[40vh] overflow-hidden bg-green-700">
        <Image
          src="/images/contact-hero.jpg"
          alt="Contact Plant Haven"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 to-transparent"></div>
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get In Touch
            </h1>
            <p className="text-xl text-white/90">
              Have questions about plants or need gardening advice? We're here to help your garden thrive.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">Send Us a Message</h2>
              
              {formStatus === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <p>Your message has been sent successfully! We'll get back to you soon.</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Plant Care Question"
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your gardening needs or questions..."
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500 min-h-[150px]"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Visit Our Nursery</h3>
                    <p className="text-gray-600">123 Green Valley Road,</p>
                    <p className="text-gray-600">Bangalore, Karnataka,</p>
                    <p className="text-gray-600">India - 560001</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Call Us</h3>
                    <p className="text-gray-600">Customer Service: +91 98765 43210</p>
                    <p className="text-gray-600">Wholesale Inquiries: +91 98765 43211</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Email Us</h3>
                    <p className="text-gray-600">General Inquiries: hello@planthaven.com</p>
                    <p className="text-gray-600">Customer Support: support@planthaven.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Working Hours</h3>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-green-800 mb-6">Connect With Us</h2>
              <div className="flex gap-4">
                <a href="#" className="bg-green-100 p-3 rounded-full hover:bg-green-200 transition-colors">
                  <Facebook className="h-6 w-6 text-green-600" />
                </a>
                <a href="#" className="bg-green-100 p-3 rounded-full hover:bg-green-200 transition-colors">
                  <Instagram className="h-6 w-6 text-green-600" />
                </a>
                <a href="#" className="bg-green-100 p-3 rounded-full hover:bg-green-200 transition-colors">
                  <Twitter className="h-6 w-6 text-green-600" />
                </a>
                <a href="#" className="bg-green-100 p-3 rounded-full hover:bg-green-200 transition-colors">
                  <Linkedin className="h-6 w-6 text-green-600" />
                </a>
              </div>
              <p className="mt-4 text-gray-600">
                Follow us on social media for gardening tips, new arrivals, and special offers!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-8 container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <h2 className="sr-only">Our Location</h2>
          <div className="h-[400px] w-full relative">
            <Image
              src="/images/map.jpg"
              alt="Map location of Plant Haven nursery"
              fill
              className="object-cover"
            />
            {/* If you want to embed an actual Google Map, replace the Image component with an iframe */}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-3 text-green-700">Do you offer plant delivery?</h3>
            <p className="text-gray-700">
              Yes, we offer delivery services within Bangalore city, with free shipping on orders above ₹500. For locations outside Bangalore, we use specialized plant shipping services.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-3 text-green-700">What if my plant arrives damaged?</h3>
            <p className="text-gray-700">
              We take great care in packaging our plants, but if your plant arrives damaged, please contact us within 48 hours with photos, and we'll arrange a replacement or refund.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-3 text-green-700">Do you offer plant care consultation?</h3>
            <p className="text-gray-700">
              Yes! Our experts provide personalized plant care consultations in-store or virtually. You can book a 30-minute session through our website or by calling our customer service.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="font-semibold text-lg mb-3 text-green-700">Can I return plants if they don't work for my space?</h3>
            <p className="text-gray-700">
              We accept returns within 7 days for healthy plants. Please ensure the plant is in its original pot and has been properly cared for. A 10% restocking fee may apply.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-10">
          <p className="text-gray-700 mb-4">Didn't find what you're looking for?</p>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            View All FAQs
          </Button>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-4">Stay Connected</h2>
          <p className="text-gray-700 mb-8">
            Subscribe to our newsletter for gardening tips, seasonal plant care advice, and exclusive offers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              placeholder="Enter your email address" 
              className="border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
            <Button className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 whitespace-nowrap">
              Subscribe
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from Plant Haven.
          </p>
        </div>
      </section>
    </div>
  );
}