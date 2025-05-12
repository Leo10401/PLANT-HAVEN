const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  // For development, you can use a test service like Ethereal or Mailtrap
  // For production, configure your actual email service here
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

/**
 * Send order notification to seller
 * @param {Object} sellerInfo - Seller's contact information
 * @param {Object} orderInfo - Order details
 * @returns {Promise<Object>} Email sending result
 */
async function sendOrderNotification(sellerInfo, orderInfo) {
  try {
    const { email, name } = sellerInfo;
    const { _id, items, totalAmount, shippingAddress, paymentMethod } = orderInfo;
    
    // Create email message
    const itemsList = items.map(item => 
      `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('<br>');
    
    // Format shipping address
    const formattedAddress = `
      ${shippingAddress.address}<br>
      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
      ${shippingAddress.country}<br>
      Phone: ${shippingAddress.phoneNumber}
    `;

    const message = {
      from: process.env.EMAIL_FROM || '"Plant Haven" <orders@planthaven.com>',
      to: email,
      subject: `New Order Received - #${_id.substring(_id.length - 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2e7d32;">New Order Received</h2>
          <p>Hello ${name || 'Seller'},</p>
          <p>You have received a new order. Please process it as soon as possible.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${_id}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod === 'cashOnDelivery' ? 'Cash on Delivery' : paymentMethod}</p>
            <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
          </div>
          
          <h3>Items Ordered</h3>
          <div style="border: 1px solid #e0e0e0; border-radius: 5px; padding: 10px; margin-bottom: 20px;">
            ${itemsList}
          </div>
          
          <h3>Shipping Address</h3>
          <div style="border: 1px solid #e0e0e0; border-radius: 5px; padding: 10px;">
            ${formattedAddress}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
            <p>Thank you for selling with Plant Haven!</p>
            <p style="font-size: 12px;">Please log in to your seller dashboard to manage this order.</p>
          </div>
        </div>
      `
    };
    
    // Send the email
    const result = await transporter.sendMail(message);
    
    console.log('Order notification email sent to seller:', email);
    return result;
    
  } catch (error) {
    console.error('Error sending order notification email:', error);
    throw error;
  }
}

module.exports = {
  sendOrderNotification
}; 