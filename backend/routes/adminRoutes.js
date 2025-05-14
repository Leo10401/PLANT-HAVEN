const express = require('express');
const router = express.Router();
const { model } = require('../connection');
const Seller = require('../models/seller');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const verifyAdmin = require('../utils/verifyAdmin');

// Get User model through the connection
const User = model('user');

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

// Admin get all products
router.get('/products', verifyAdmin, async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'name shopName');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// Admin delete product
router.delete('/products/:id', verifyAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

// Get all orders
router.get('/orders', verifyAdmin, async (req, res) => {
    try {
        // Get all orders
        const orders = await Order.find().sort({ createdAt: -1 });
        
        console.log('Orders fetched successfully, count:', orders.length);
        
        // Collect all unique user IDs from orders
        const userIds = [...new Set(orders.map(order => order.userId))];
        
        // Fetch user info separately
        const users = await User.find({ _id: { $in: userIds } }).select('name email');
        
        // Create a map of user data for quick lookup
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = {
                name: user.name,
                email: user.email
            };
        });
        
        // Attach user data to each order
        const ordersWithUserInfo = orders.map(order => {
            const orderObj = order.toObject();
            const userId = order.userId.toString();
            
            if (userMap[userId]) {
                orderObj.userId = {
                    _id: userId,
                    name: userMap[userId].name,
                    email: userMap[userId].email
                };
            }
            
            return orderObj;
        });
        
        res.json(ordersWithUserInfo);
    } catch (error) {
        console.error('Error fetching orders detail:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Update order status
router.patch('/orders/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        order.status = status;
        
        // If marked as delivered, update delivery status
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        
        // If cancelled, restore product stock
        if (status === 'cancelled' && ['pending', 'processing'].includes(order.status)) {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.quantity } },
                    { new: true }
                );
            }
        }
        
        await order.save();
        
        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
});

module.exports = router; 