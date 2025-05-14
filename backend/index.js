const express = require('express');
const app = express();
require('dotenv').config();

const userRouter = require('./routes/userRoutes');
const prodRouter = require('./routes/productRoutes');
const sellerRouter = require('./routes/seller');
const reviewRouter = require('./routes/reviewRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const razorpayRouter = require('./routes/razorpay');
const adminRouter = require('./routes/adminRoutes');




const cors = require('cors');

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Enhanced CORS configuration to handle both with and without trailing slash
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, etc)
    if(!origin) return callback(null, true);
    
    // Create array with both versions of the origin (with and without trailing slash)
    const allowedOrigins = [
      CORS_ORIGIN,
      CORS_ORIGIN.endsWith('/') ? CORS_ORIGIN.slice(0, -1) : CORS_ORIGIN + '/'
    ];
    
    if(allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS policy violation: ${origin} not allowed`), false);
    }
  },
  credentials: true // Add this if you need to support cookies or authentication
}));

app.use(express.json());

app.use('/user', userRouter);
app.use('/prod', prodRouter);
app.use('/seller', sellerRouter);
app.use('/reviews', reviewRouter);
app.use('/cart', cartRouter);
app.use('/orders', orderRouter);
app.use('/razorpay', razorpayRouter);
app.use('/admin', adminRouter);

app.get('/', (req, res) => {
    res.send('response from express');
});

app.get('/add', (req, res) => {
    res.send('response from add');
});

// Add an error handler for CORS errors
app.use((err, req, res, next) => {
  if (err.message.includes('CORS policy violation')) {
    console.error(err.message);
    return res.status(403).json({
      error: 'CORS error',
      message: 'Cross-Origin Request Blocked',
      details: err.message
    });
  }
  next(err);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS configured for origin: ${CORS_ORIGIN}`);
});