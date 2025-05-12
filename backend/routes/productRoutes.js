const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const auth = require('../middleware/auth');
const multer = require('multer');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('seller', 'name shopName');
        res.json(products);
    } catch (error) {
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

// Get seller's products
router.get('/seller', auth, async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id });
        res.json(products);
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

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name shopName');
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
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

module.exports = router;
