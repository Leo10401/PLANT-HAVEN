const express = require('express');
const router = express.Router();
const Review = require('../models/reviewModel');
const userAuth = require('../middleware/userAuth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a review
router.post('/', userAuth, async (req, res) => {
    try {
        const review = new Review({
            ...req.body,
            user: req.user.id
        });
        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a review
router.put('/:id', userAuth, async (req, res) => {
    try {
        const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }
        Object.assign(review, req.body);
        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a review
router.delete('/:id', userAuth, async (req, res) => {
    try {
        const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }
        await review.deleteOne();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark review as helpful
router.post('/:id/helpful', userAuth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        review.helpful += 1;
        await review.save();
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 