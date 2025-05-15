"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  User,
  Home,
  Search,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  Filter,
  ChevronDown,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminSellersPage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (loading) return;

    // Redirect if not authenticated or not admin
    if (!user) {
      toast.error('Please login to access admin dashboard');
      window.location.href = '/identify';
      return;
    }

    if (!isAdmin()) {
      toast.error('You do not have permission to access this page');
      window.location.href = '/';
      return;
    }

    fetchSellers();
  }, [user, loading, router]);

  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      
      // Get token
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        window.location.href = '/identify';
        return;
      }

      // Ensure token is properly formatted
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Fetch sellers
      const response = await fetch('http://localhost:5000/admin/sellers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Not authorized to access admin sellers');
          window.location.href = '/';
          return;
        }
        
        // Try to get the error message from the response
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to fetch sellers');
      }

      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error(`Error: ${error.message || 'Failed to load sellers'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSeller = async (sellerId) => {
    if (!confirm('Are you sure you want to delete this seller?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await fetch(`http://localhost:5000/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': formattedToken
        }
      });

      if (response.ok) {
        toast.success('Seller deleted successfully');
        fetchSellers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete seller');
      }
    } catch (error) {
      console.error('Error deleting seller:', error);
      toast.error('An error occurred while deleting the seller');
    }
  };

  const handleToggleSellerStatus = async (sellerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      const response = await fetch(`http://localhost:5000/admin/sellers/${sellerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Seller ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        fetchSellers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to update seller status`);
      }
    } catch (error) {
      console.error('Error updating seller status:', error);
      toast.error('An error occurred while updating the seller status');
    }
  };

  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    // Filter by status
    if (filter !== 'all' && seller.status !== filter) {
      return false;
    }
    
    // Search by name or email or shop name
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (seller.name && seller.name.toLowerCase().includes(query)) ||
        (seller.email && seller.email.toLowerCase().includes(query)) ||
        (seller.shopName && seller.shopName.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 text-transparent bg-clip-text">
                Qkart Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                <Link 
                  href="/admin/dashboard" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  href="/admin/users" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Users className="h-4 w-4" />
                  Users
                </Link>
                <Link 
                  href="/admin/sellers" 
                  className="flex items-center gap-3 rounded-lg bg-gray-100 px-3 py-2 text-gray-900 transition-all"
                >
                  <Store className="h-4 w-4" />
                  Sellers
                </Link>
                <Link 
                  href="/admin/products" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <Package className="h-4 w-4" />
                  Products
                </Link>
                <Link 
                  href="/admin/orders" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </Link>
                <Link 
                  href="/admin/analytics" 
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 transition-all"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Seller Management</h1>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search sellers..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Status
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  <span className={filter === 'all' ? 'text-green-600 font-medium' : ''}>All Sellers</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('active')}>
                  <span className={filter === 'active' ? 'text-green-600 font-medium' : ''}>Active</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('suspended')}>
                  <span className={filter === 'suspended' ? 'text-green-600 font-medium' : ''}>Suspended</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('pending')}>
                  <span className={filter === 'pending' ? 'text-green-600 font-medium' : ''}>Pending Approval</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sellers table */}
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.length > 0 ? (
                  filteredSellers.map((seller) => (
                    <TableRow key={seller._id}>
                      <TableCell className="font-medium">{seller._id.substring(0, 8)}...</TableCell>
                      <TableCell>{seller.shopName || 'N/A'}</TableCell>
                      <TableCell>{seller.name || 'N/A'}</TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>
                        <Badge className={
                          seller.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                          seller.status === 'suspended' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                          'bg-amber-100 text-amber-800 hover:bg-amber-100'
                        }>
                          {seller.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(seller.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => router.push(`/admin/sellers/${seller._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button> */}
                          {/* {seller.status === 'active' ? (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => handleToggleSellerStatus(seller._id, seller.status)}
                              title="Suspend Seller"
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleToggleSellerStatus(seller._id, seller.status)}
                              title="Activate Seller"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )} */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteSeller(seller._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchQuery || filter !== 'all' ? 'No sellers match your search criteria.' : 'No sellers found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
} 