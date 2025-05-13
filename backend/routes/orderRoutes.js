const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Seller = require('../models/seller');
const verifyToken = require('./verifyToken');
const { sendOrderNotification } = require('../utils/emailService');

// Create a new order
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { userId, items, shippingAddress, paymentMethod, totalAmount, status } = req.body;
    
    console.log('Creating order for userId:', userId);
    
    // Ensure userId is properly formatted (use the verified user's ID if possible)
    const verifiedUserId = req.user._id || userId;
    
    // Create new order
    const newOrder = new Order({
      userId: verifiedUserId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status,
      isPaid: paymentMethod !== 'cashOnDelivery' // Mark as paid if not COD
    });

    // If payment method is not COD, record payment date
    if (paymentMethod !== 'cashOnDelivery') {
      newOrder.paidAt = Date.now();
    }

    // Save the order
    const savedOrder = await newOrder.save();
    
    console.log('Order saved successfully, order ID:', savedOrder._id);
    console.log('Order userId stored as:', savedOrder.userId);

    // Track sellers to notify (to avoid duplicate notifications)
    const notifiedSellers = new Set();

    // Update product stock and notify sellers
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      // Get seller information to send notification
      const product = await Product.findById(item.productId);
      if (product && product.seller) {
        const sellerId = product.seller.toString();
        
        // Only notify each seller once per order
        if (!notifiedSellers.has(sellerId)) {
          const seller = await Seller.findById(sellerId);
          
          if (seller && seller.email) {
            try {
              // Send email notification to seller
              await sendOrderNotification(seller, savedOrder);
              
              // Mark as notified
              notifiedSellers.add(sellerId);
            } catch (emailError) {
              console.error('Failed to send seller notification email:', emailError);
              // Continue processing even if email fails
            }
          }
        }
      }
    }

    // Update order with notification status
    if (notifiedSellers.size > 0) {
      await Order.findByIdAndUpdate(
        savedOrder._id,
        { sellerNotified: true },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get all orders (debugging route)
router.get('/getall', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    
    console.log(`Retrieved all ${orders.length} orders for debugging`);
    
    // Log userId formats for debugging
    if (orders.length > 0) {
      console.log('Sample order userId format:', {
        userId: orders[0].userId,
        type: typeof orders[0].userId,
        asString: orders[0].userId.toString()
      });
    }
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all orders',
      error: error.message
    });
  }
});

// Get all orders for a user
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    console.log('Fetching orders for userId:', userId);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Convert string ID to ObjectId if needed
    let query = { userId };
    
    // Also try to find orders where userId as string matches
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    // If no orders found, try another query approach
    if (orders.length === 0) {
      // Try with looser comparison (useful for debugging)
      const allOrders = await Order.find().sort({ createdAt: -1 });
      const matchingOrders = allOrders.filter(order => {
        const orderUserId = order.userId.toString();
        const paramUserId = userId.toString();
        const isMatch = orderUserId === paramUserId;
        console.log(`Comparing: ${orderUserId} with ${paramUserId}, match: ${isMatch}`);
        return isMatch;
      });
      
      console.log(`Found ${matchingOrders.length} orders after loose comparison`);
      
      if (matchingOrders.length > 0) {
        return res.status(200).json({
          success: true,
          orders: matchingOrders,
          message: 'Orders found with loose comparison'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get orders for a seller
router.get('/seller/:sellerId', verifyToken, async (req, res) => {
  try {
    const requestedSellerId = req.params.sellerId;
    const authenticatedUserId = req.user.id || req.user._id;
    
    console.log("Requested seller ID:", requestedSellerId);
    console.log("Authenticated user ID:", authenticatedUserId);
    
    // Security check: ensure seller can only access their own orders
    if (requestedSellerId !== authenticatedUserId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own orders',
        requestedId: requestedSellerId,
        yourId: authenticatedUserId.toString()
      });
    }
    
    // Find products owned by this seller
    const products = await Product.find({ seller: requestedSellerId });
    
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No products found for this seller',
        orders: []
      });
    }
    
    const productIds = products.map(product => product._id);
    console.log(`Found ${products.length} products for seller ${requestedSellerId}`);
    
    // Find orders containing these products
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders for seller ${requestedSellerId}`);
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get specific order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    // Fetch order without attempting to populate userId
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
});

// Update order status
router.patch('/update-status/:orderId', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const sellerId = req.user.id || req.user._id;
    
    // Find the order
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get products owned by this seller
    const sellerProducts = await Product.find({ seller: sellerId });
    
    if (sellerProducts.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You have no products as a seller'
      });
    }
    
    // Convert product IDs to strings for comparison
    const sellerProductIds = sellerProducts.map(p => p._id.toString());
    
    // Check if order contains at least one product from this seller
    const orderItemProducts = order.items.map(item => item.productId.toString());
    
    console.log('Seller products:', sellerProductIds);
    console.log('Order products:', orderItemProducts);
    
    const hasSellerProduct = order.items.some(item => 
      sellerProductIds.includes(item.productId.toString())
    );
    
    if (!hasSellerProduct) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders containing your products',
        yourProducts: sellerProductIds,
        orderProducts: orderItemProducts
      });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Mark order as paid (for COD orders)
router.patch('/mark-paid/:orderId', verifyToken, async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    
    // Find the order
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get products owned by this seller
    const sellerProducts = await Product.find({ seller: sellerId });
    
    if (sellerProducts.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You have no products as a seller'
      });
    }
    
    // Convert product IDs to strings for comparison
    const sellerProductIds = sellerProducts.map(p => p._id.toString());
    
    // Check if order contains at least one product from this seller
    const hasSellerProduct = order.items.some(item => 
      sellerProductIds.includes(item.productId.toString())
    );
    
    if (!hasSellerProduct) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders containing your products'
      });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        isPaid: true,
        paidAt: Date.now()
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Order marked as paid',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error marking order as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark order as paid',
      error: error.message
    });
  }
});

// Mark order as delivered
router.patch('/mark-delivered/:orderId', verifyToken, async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    
    // Find the order
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get products owned by this seller
    const sellerProducts = await Product.find({ seller: sellerId });
    
    if (sellerProducts.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You have no products as a seller'
      });
    }
    
    // Convert product IDs to strings for comparison
    const sellerProductIds = sellerProducts.map(p => p._id.toString());
    
    // Check if order contains at least one product from this seller
    const hasSellerProduct = order.items.some(item => 
      sellerProductIds.includes(item.productId.toString())
    );
    
    if (!hasSellerProduct) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders containing your products'
      });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { 
        isDelivered: true,
        deliveredAt: Date.now(),
        status: 'delivered'
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Order marked as delivered',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark order as delivered',
      error: error.message
    });
  }
});

// Cancel order
router.patch('/cancel/:orderId', verifyToken, async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Find the order
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // For sellers - verify they have products in this order
    if (req.user.role === 'seller') {
      // Get products owned by this seller
      const sellerProducts = await Product.find({ seller: sellerId });
      const sellerProductIds = sellerProducts.map(p => p._id.toString());
      
      // Check if order contains at least one product from this seller
      const hasSellerProduct = order.items.some(item => 
        sellerProductIds.includes(item.productId.toString())
      );
      
      if (!hasSellerProduct) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel orders containing your products'
        });
      }
    }
    
    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    await order.save();
    
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
});

module.exports = router;