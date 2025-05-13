const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/seller');
const auth = require('../middleware/auth');

// Seller Registration Route
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            shopName,
            gstNumber,
            description,
            location,
            contactNumber
        } = req.body;

        // Validate GST number format
        if (!gstNumber || !/^[0-9A-Z]{15}$/.test(gstNumber)) {
            return res.status(400).json({
                message: 'Invalid GST number format. It must be exactly 15 alphanumeric characters.'
            });
        }

        // Check if seller already exists
        const existingSeller = await Seller.findOne({ 
            $or: [
                { email: email },
                { gstNumber: gstNumber }
            ]
        });

        if (existingSeller) {
            return res.status(400).json({ 
                message: 'Seller with this email or GST number already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new seller
        const seller = new Seller({
            name,
            email,
            password: hashedPassword,
            shopName,
            gstNumber,
            description,
            location,
            contactNumber
        });

        await seller.save();

        res.status(201).json({
            message: 'Seller registered successfully',
            seller: {
                id: seller._id,
                name: seller.name,
                email: seller.email,
                shopName: seller.shopName,
                role: seller.role
            }
        });

    } catch (error) {
        console.error('Seller registration error:', error);
        res.status(500).json({ message: 'Error registering seller' });
    }
});

// Seller Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if seller exists
        const seller = await Seller.findOne({ email });
        if (!seller) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: seller._id,
                email: seller.email,
                role: seller.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            seller: {
                id: seller._id,
                name: seller.name,
                email: seller.email,
                shopName: seller.shopName,
                role: seller.role
            }
        });

    } catch (error) {
        console.error('Seller login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

router.get('/getall', (req, res) => {
    Seller.find()
        .then((result) => {
            res.status(200).json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
})

// : denotes url parameter
router.get('/getbyemail/:email', (req, res) => {
    console.log(req.params.email);

    Seller.findOne({ email: req.params.email })
        .then((result) => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'User Not Found' });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/getbyid/:id', (req, res) => {
    Seller.findById(req.params.id)
        .then((result) => {
            res.status(200).json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.put('/update/:id', (req, res) => {
    Seller.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then((result) => {
            res.status(200).json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.delete('/delete/:id', (req, res) => {
    Seller.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.status(200).json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/getbyuser', auth, (req, res) => {
    Seller.findById(req.user.id)
        .then((result) => {
            if (!result) {
                return res.status(404).json({ message: 'Seller not found' });
            }
            res.status(200).json(result);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
});

// Check if user has a seller account
router.post('/check', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if seller exists with this email
        const seller = await Seller.findOne({ email });
        
        res.status(200).json({
            hasSellerAccount: !!seller
        });
    } catch (error) {
        console.error('Seller check error:', error);
        res.status(500).json({ message: 'Error checking seller account' });
    }
});

module.exports = router; 