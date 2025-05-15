"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Leaf,
  Package,
  ChevronRight,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ManageProducts() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (loading) return;
    console.log(user);

    // Check if user is authenticated and is a seller
    if (!user) {

      toast.error('Please login to manage your products');
      router.push('/identify');
      return;
    }

    fetchProducts();
  }, [user, loading, router]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      // Get sellerId from auth context
      const sellerId = user?.id;

      if (!sellerId) {
        toast.error('Seller ID not found. Please log in again');
        router.push('/identify');
        return;
      }

      console.log('Fetching products for seller ID:', sellerId);

      const response = await fetch(`http://localhost:5000/prod/seller`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data);
        console.log(`Retrieved ${data.length || 0} seller products`);
      } else {
        toast.error(data.message || 'Failed to load products');

        if (response.status === 401 || response.status === 403) {
          router.push('/identify');
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId, productName) => {
    try {
      if (!confirm(`Are you sure you want to delete the product "${productName}"? This action cannot be undone.`)) {
        return;
      }

      console.log('Deleting product:', productId, productName);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success(`Product "${productName}" deleted successfully`);
        // Remove the product from the UI
        setProducts(products.filter(product => product._id !== productId));
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      'indoor': 'bg-green-50 text-green-600 border-green-200',
      'outdoor': 'bg-blue-50 text-blue-600 border-blue-200',
      'succulents': 'bg-amber-50 text-amber-600 border-amber-200',
      'flowering': 'bg-pink-50 text-pink-600 border-pink-200',
      'trees': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'herbs': 'bg-purple-50 text-purple-600 border-purple-200',
      'rare': 'bg-red-50 text-red-600 border-red-200'
    };

    return (
      <Badge variant="outline" className={categoryColors[category] || 'bg-gray-50 text-gray-600 border-gray-200'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const getApprovalBadge = (isApproved) => {
    if (isApproved) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Approved
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Pending Approval
        </Badge>
      );
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false;
    }

    // Search by name or description
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest':
        return b.price - a.price;
      case 'lowest':
        return a.price - b.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
              <img src="/qkartlogo.png" alt="" height={64} width={40} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
              Qkart
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/seller/dashboard" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/seller/manage-products" className="text-sm font-medium text-green-600">
              Products
            </Link>
            <Link href="/seller/orders" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Orders
            </Link>
            <Link href="/seller/product-orders" className="text-sm text-gray-600 hover:text-green-600 transition-colors">
              Product Orders
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/seller/dashboard" className="hover:text-green-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-700 font-medium">Manage Products</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search Box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full md:w-64"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40 border-gray-200">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="succulents">Succulents</SelectItem>
                <SelectItem value="flowering">Flowering</SelectItem>
                <SelectItem value="trees">Trees</SelectItem>
                <SelectItem value="herbs">Herbs</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Price</SelectItem>
                <SelectItem value="lowest">Lowest Price</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            {/* Add New Product */}
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => router.push('/seller/sellproduct')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Box className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Categories</p>
                <p className="text-2xl font-bold">
                  {new Set(products.map(p => p.category)).size}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.stock < 5).length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* New card for approved products */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved Products</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => p.isApproved).length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-green-600"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {sortedProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead> {/* New column for approval status */}
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map(product => (
                    <TableRow key={product._id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {product.description.length > 60
                                ? `${product.description.substring(0, 60)}...`
                                : product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(product.category)}</TableCell>
                      <TableCell>{getApprovalBadge(product.isApproved)}</TableCell> {/* New status cell */}
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${product.stock < 5 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(product.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/seller/update-product/${product._id}`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deleteProduct(product._id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || categoryFilter !== 'all'
                  ? 'Try changing your filters or search terms'
                  : 'You don\'t have any products yet'}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {(searchQuery || categoryFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/seller/sellproduct')}
                >
                  Add Your First Product
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
