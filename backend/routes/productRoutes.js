const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const auth = require('../middleware/auth');
const multer = require('multer');
const jwt = require('jsonwebtoken');

// Get all products (public) - only show approved products
router.get('/', async (req, res) => {
  try {
    const filters = { isApproved: true };
    
    // Add any other filter parameters from request
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    const products = await Product.find(filters).populate('seller', 'name shopName');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category })
            .populate('seller', 'name shopName');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get seller's products - shows both approved and unapproved
router.get('/seller', auth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.userId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product
router.post('/', auth, async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            seller: req.user.id
        });

        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        await product.deleteOne();
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single product - with owner check for seller context
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name shopName');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if request has a token (seller context)
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                
                // If user is a seller and not the owner of this product
                const tokenSellerId = decoded.id || decoded._id;
                const productSellerId = product.seller._id.toString();
                
                console.log('Token seller ID:', tokenSellerId);
                console.log('Product seller ID:', productSellerId);
                
                if (decoded.role === 'seller' && tokenSellerId !== productSellerId) {
                    console.log(`Access denied: Seller ${tokenSellerId} trying to access product owned by ${productSellerId}`);
                    return res.status(403).json({ 
                        message: 'Access denied. You can only view your own products in seller context.' 
                    });
                }
            } catch (error) {
                // Invalid token, but we'll still return the product since this endpoint is public
                // Just log the attempt
                console.log('Invalid token in product get request:', error.message);
            }
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove multer for /prod route and use only auth middleware
router.post('/prod', auth, async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      seller: req.user.id
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin route to approve products
router.put('/approve/:id', auth, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: true, 
        approvedAt: Date.now(),
        approvedBy: req.user._id
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Product approved successfully',
      product 
    });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin route to reject products
router.put('/reject/:id', auth, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: false,
        approvedAt: null,
        approvedBy: null
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Product rejected successfully',
      product 
    });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin route to get all products (including unapproved ones)
router.get('/admin/products', auth, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    const products = await Product.find().populate('seller', 'name shopName');
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
