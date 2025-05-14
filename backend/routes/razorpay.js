require('dotenv').config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const express = require("express");
const userAuth = require("../middleware/userAuth");

const router = express.Router();

// Check if Razorpay credentials are available
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpaySecret = process.env.RAZORPAY_SECRET;

if (!razorpayKeyId || !razorpaySecret) {
    console.error('⚠️ Razorpay credentials missing. Please check your .env file');
    console.error('RAZORPAY_KEY_ID:', razorpayKeyId ? '✅ Found' : '❌ Missing');
    console.error('RAZORPAY_SECRET:', razorpaySecret ? '✅ Found' : '❌ Missing');
}

// Initialize Razorpay
let razorpay;
try {
    razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpaySecret,
    });
    console.log('✅ Razorpay initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error);
}

// Create a new Razorpay order
router.post("/create-order", userAuth, async (req, res) => {
    console.log("Received create-order request:", req.body);
    const { amount, currency = 'INR' } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error("Invalid amount:", amount);
        return res.status(400).json({ error: "Invalid amount. Amount must be a positive number." });
    }

    try {
        console.log(`Creating Razorpay order: amount=${amount * 100} currency=${currency}`);
        
        // Amount should be in smallest currency unit (paise for INR)
        const options = {
            amount: Math.round(amount * 100), // Convert to paise and ensure it's an integer
            currency: currency,
            receipt: `receipt_${Date.now()}`,
        };

        console.log("Razorpay options:", options);
        console.log("Using Razorpay credentials - Key ID:", process.env.RAZORPAY_KEY_ID?.substring(0, 5) + "..." || 'missing');

        const order = await razorpay.orders.create(options);
        console.log("Razorpay order created successfully:", order.id);
        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        // Check if it's a Razorpay API error
        if (error.error) {
            console.error("Razorpay API error:", error.error);
        }
        // Return more detailed error information
        res.status(500).json({ 
            error: "Failed to create order", 
            details: error.message,
            name: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
});

// Verify Razorpay payment
router.post("/verify-payment", userAuth, async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify signature
    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        console.log("Payment verified successfully");
        res.json({ success: true });
    } else {
        console.error("Payment verification failed");
        res.status(400).json({ error: "Payment verification failed" });
    }
});

module.exports = router; 