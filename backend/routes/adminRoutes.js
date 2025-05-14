const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Seller = require('../models/seller');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const verifyAdmin = require('../utils/verifyAdmin');

// Admin dashboard statistics
router.get('/dashboard', verifyAdmin, async (req, res) => {
    console.log('Admin dashboard API called');
    try {
        // Get counts of different entities
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalSellers = await Seller.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        console.log('Counts fetched successfully:', { totalUsers, totalSellers, totalProducts, totalOrders });

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        console.log('Recent orders fetched:', recentOrders.length);

        // Get top products (by order frequency)
        const topProducts = await Product.find()
            .limit(5)
            .lean();

        console.log('Top products fetched:', topProducts.length);

        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt')
            .lean();

        console.log('Recent users fetched:', recentUsers.length);

        // Format the response data
        const formattedRecentOrders = recentOrders.map(order => ({
            id: order._id,
            user: 'User', // Hardcoded for now as we don't have user info
            amount: order.totalAmount,
            status: order.status,
            date: new Date(order.createdAt).toISOString().split('T')[0]
        }));

        const formattedTopProducts = topProducts.map(product => ({
            id: product._id,
            name: product.name,
            sales: product.sales || 0,
            stock: product.stock || 0
        }));

        const formattedRecentUsers = recentUsers.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            date: new Date(user.createdAt).toISOString().split('T')[0]
        }));

        const responseData = {
            totalUsers,
            totalSellers,
            totalProducts,
            totalOrders,
            recentOrders: formattedRecentOrders,
            topProducts: formattedTopProducts,
            recentUsers: formattedRecentUsers
        };

        console.log('Sending response data');
        res.json(responseData);
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
});

// Delete a user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Delete a seller
router.delete('/sellers/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const seller = await Seller.findByIdAndDelete(id);
        
        if (!seller) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        
        res.json({ message: 'Seller deleted successfully' });
    } catch (error) {
        console.error('Error deleting seller:', error);
        res.status(500).json({ message: 'Error deleting seller' });
    }
});

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get all sellers
router.get('/sellers', verifyAdmin, async (req, res) => {
    try {
        const sellers = await Seller.find().sort({ createdAt: -1 });
        res.json(sellers);
    } catch (error) {
        console.error('Error fetching sellers:', error);
        res.status(500).json({ message: 'Error fetching sellers' });
    }
});

// Get all products
router.get('/products', verifyAdmin, async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .populate('seller', 'name shopName');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get all orders
router.get('/orders', verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

module.exports = router; 