'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast, { Toaster } from 'react-hot-toast';

export default function SellerRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        shopName: '',
        gstNumber: '',
        description: '',
        location: '',
        contactNumber: '',
        mapLocation: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Add GST number validation
        if (name === 'gstNumber') {
            // Remove any spaces and convert to uppercase
            const formattedGST = value.replace(/\s/g, '').toUpperCase();
            
            // Update the form data first
            setFormData(prev => ({
                ...prev,
                [name]: formattedGST
            }));

            // Only validate if there's input
            if (formattedGST.length > 0) {
                // Check length first
                if (formattedGST.length > 15) {
                    toast.error('GST number must be exactly 15 characters');
                    return;
                }

                // Check if it's complete (15 characters)
                if (formattedGST.length === 15) {
                    // Validate format only when complete
                    const isValidFormat = /^[0-9A-Z]{15}$/.test(formattedGST);
                    if (!isValidFormat) {
                        toast.error('GST number must contain only numbers and uppercase letters');
                    }
                }
            }
            return;
        }
        
        // Handle map location iframe
        if (name === 'mapLocation') {
            // Extract the src URL from the iframe
            const iframeMatch = value.match(/src="([^"]+)"/);
            const mapUrl = iframeMatch ? iframeMatch[1] : value;
            
            setFormData(prev => ({
                ...prev,
                [name]: mapUrl
            }));
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/seller/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                router.push('/identify');
            }, 2000);
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Seller Registration</CardTitle>
                    <CardDescription>
                        Register your shop to start selling plants
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="shopName" className="text-sm font-medium">Shop Name</label>
                                <Input
                                    id="shopName"
                                    name="shopName"
                                    type="text"
                                    required
                                    value={formData.shopName}
                                    onChange={handleChange}
                                    placeholder="Enter your shop name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="gstNumber" className="text-sm font-medium">GST Number</label>
                                <Input
                                    id="gstNumber"
                                    name="gstNumber"
                                    type="text"
                                    required
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your GST number"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contactNumber" className="text-sm font-medium">Contact Number</label>
                                <Input
                                    id="contactNumber"
                                    name="contactNumber"
                                    type="tel"
                                    required
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    placeholder="Enter your contact number"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="location" className="text-sm font-medium">Shop Location</label>
                                <Input
                                    id="location"
                                    name="location"
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter your shop location"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="mapLocation" className="text-sm font-medium">Map Location</label>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">
                                        To add your shop location on map:
                                        1. Go to Google Maps
                                        2. Search for your location
                                        3. Click "Share"
                                        4. Select "Embed a map"
                                        5. Copy the iframe code and paste it below
                                    </p>
                                    <Textarea
                                        id="mapLocation"
                                        name="mapLocation"
                                        value={formData.mapLocation}
                                        onChange={handleChange}
                                        placeholder="Paste your Google Maps iframe code here"
                                        rows={4}
                                    />
                                    {formData.mapLocation && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium mb-2">Preview:</p>
                                            <div className="w-full h-[300px]">
                                                <iframe
                                                    src={formData.mapLocation}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    allowFullScreen=""
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                ></iframe>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="description" className="text-sm font-medium">Shop Description</label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe your shop and what you sell"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Register as Seller'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 
