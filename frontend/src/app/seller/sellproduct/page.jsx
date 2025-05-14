'use client';
import React, { useState, useRef } from "react";
import { ArrowLeft, Leaf, Upload, X, Plus, Check, Info, PlayCircle, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

const SellProductPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    stock: "",
  });

  // Image upload state
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Updating form field:', name, 'with value:', value); // Debug log
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      console.log('New form data:', newData); // Debug log
      return newData;
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = files.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImages]);
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  // Handle video upload
  const handleVideoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove video
  const removeVideo = () => {
    setVideoUrl("");
    setVideoFile(null);
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const videoFiles = files.filter((file) => file.type.startsWith("video/"));

      if (imageFiles.length > 0) {
        const newImages = imageFiles.map((file) => URL.createObjectURL(file));
        setImages((prev) => [...prev, ...newImages]);
        setImageFiles((prev) => [...prev, ...imageFiles]);
      }

      if (videoFiles.length > 0 && !videoFile) {
        const file = videoFiles[0];
        setVideoFile(file);
        setVideoUrl(URL.createObjectURL(file));
      }
    }
  };

  // Cloudinary upload helper
  async function uploadToCloudinary(file, resourceType = 'image') {
    const url = `https://api.cloudinary.com/v1_1/de4osq89e/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'myuploadpreset');
    formData.append('folder', 'plant');

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log(data);
    return data.secure_url;
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Current form data:', formData); // Debug log
      // 1. Upload images to Cloudinary
      const imageUrls = [];
      for (const file of imageFiles) {
        const url = await uploadToCloudinary(file, 'image');
        imageUrls.push(url);
      }

      // 2. Upload video to Cloudinary (if any)
      let videoUrl = '';
      if (videoFile) {
        videoUrl = await uploadToCloudinary(videoFile, 'video');
      }

      // 3. Prepare product data
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description.trim(),
        images: imageUrls,
        video: videoUrl,
      };

      console.log('Processed product data:', productData); // Debug log

      // Validate required fields
      if (!productData.name || !productData.category || !productData.price || !productData.stock || !productData.description) {
        console.log('Validation failed:', {
          name: !productData.name,
          category: !productData.category,
          price: !productData.price,
          stock: !productData.stock,
          description: !productData.description
        }); // Debug log
        throw new Error('Please fill in all required fields');
      }

      // 4. Send productData as JSON to your backend
      const response = await fetch('http://localhost:5000/prod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }

      const savedProduct = await response.json(); // <--- Get the saved product

      // Show success state
      setIsSuccess(true);
      setIsSubmitting(false);

      // Show toast with image/video URLs
      toast.success(
        <div>
          <div>Product created successfully!</div>
          {savedProduct.images && savedProduct.images.length > 0 && (
            <div>
              <div><b>Images:</b></div>
              {savedProduct.images.map((url, idx) => (
                <div key={idx}>
                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                </div>
              ))}
            </div>
          )}
          {savedProduct.video && (
            <div>
              <div><b>Video:</b></div>
              <a href={savedProduct.video} target="_blank" rel="noopener noreferrer">{savedProduct.video}</a>
            </div>
          )}
        </div>,
        { duration: 10000 }
      );

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          name: "",
          category: "",
          price: "",
          description: "",
          stock: "",
        });
        setImages([]);
        setImageFiles([]);
        setVideoUrl("");
        setVideoFile(null);
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-green-100">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
              <img src="/qkartlogo.png" alt="" height={64} width={40} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Qkart
            </span>
          </div>

          <a href="/" className="flex items-center gap-2 text-sm font-medium hover:text-green-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-3">
            Seller 
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            List Your{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Plant Products
            </span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Fill out the form below to add your plants to our marketplace. High-quality images and detailed descriptions
            help your products sell faster!
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-50 to-transparent rounded-tr-full"></div>

            <form onSubmit={handleSubmit} className="p-8 relative z-10">
              {/* Success Message */}
              {isSuccess && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                  <div className="bg-green-100 rounded-full p-4 mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">Product Listed Successfully!</h3>
                  <p className="text-gray-600 mb-4">Your plant has been added to the marketplace.</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    1
                  </span>
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Plant Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Monstera Deliciosa"
                      className="w-full rounded-xl border-green-200 focus:border-green-500 focus:ring-green-500 py-6 px-4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-green-200 focus:border-green-500 focus:ring-green-500 py-3 px-4"
                      required
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      <option value="indoor">Indoor Plants</option>
                      <option value="outdoor">Outdoor Plants</option>
                      <option value="succulents">Succulents & Cacti</option>
                      <option value="flowering">Flowering Plants</option>
                      <option value="trees">Trees & Shrubs</option>
                      <option value="herbs">Herbs & Vegetables</option>
                      <option value="rare">Rare & Exotic</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="29.99"
                      className="w-full rounded-xl border-green-200 focus:border-green-500 focus:ring-green-500 py-6 px-4"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="stock" className="text-sm font-medium">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="1"
                      placeholder="10"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border-green-200 focus:border-green-500 focus:ring-green-500 py-6 px-4"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    2
                  </span>
                  Description
                </h2>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Plant Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your plant, including care instructions, size, and special features..."
                    className="w-full rounded-xl border-green-200 focus:border-green-500 focus:ring-green-500 min-h-[150px] px-4 py-2"
                    required
                  ></textarea>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />A detailed description helps customers make informed decisions
                  </p>
                </div>
              </div>

              {/* Images */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    3
                  </span>
                  Images
                </h2>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    isDragging ? "border-green-500 bg-green-50" : "border-green-200"
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="bg-green-100 rounded-full p-3">
                      <Upload className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-medium">Upload Plant Images</h3>
                    <p className="text-sm text-gray-500 mb-3">Drag and drop your images here, or click to browse</p>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-md"
                    >
                      Select Images
                    </button>
                  </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Uploaded Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-xl overflow-hidden border border-green-100">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Product image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-tr-xl rounded-bl-xl">
                              Main
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Add more images button */}
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center hover:bg-green-50 transition-colors"
                      >
                        <Plus className="h-6 w-6 text-green-600 mb-1" />
                        <span className="text-xs text-green-600">Add More</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Video */}
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    4
                  </span>
                  Video (Optional)
                </h2>

                {!videoUrl ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragging ? "border-green-500 bg-green-50" : "border-green-200"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={handleVideoUpload}
                      accept="video/*"
                      className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="bg-green-100 rounded-full p-3">
                        <PlayCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-medium">Add a Product Video</h3>
                      <p className="text-sm text-gray-500 mb-3">Show your plant in action with a short video</p>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-md"
                      >
                        Select Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-green-100">
                    <video src={videoUrl} controls className="w-full h-auto max-h-[300px] object-contain bg-black" />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    relative overflow-hidden rounded-full px-8 py-6 text-white shadow-lg shadow-green-200 transition-all
                    ${
                      isSubmitting
                        ? "bg-gray-400"
                        : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-300"
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <span className="opacity-0">List Product</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </>
                  ) : (
                    <>List Product</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Box */}
          <div className="mt-10 bg-green-50 rounded-2xl p-6 border border-green-100">
            <h3 className="font-bold text-green-800 mb-3">Tips for Successful Plant Listings</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>Use high-quality, well-lit photos that showcase the plant from multiple angles</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>Include detailed care instructions (light, water, soil preferences)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>Mention the plant's size, age, and growth habits</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>Be honest about any imperfections or special care requirements</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white py-8 border-t border-green-100 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Qkart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default SellProductPage;
