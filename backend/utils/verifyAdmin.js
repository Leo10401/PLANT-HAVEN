const jwt = require('jsonwebtoken');
const { model } = require('../connection'); // Changed to use the connection module

const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use the model function to access the User model
    const User = model('user');
    const user = await User.findById(decoded._id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = verifyAdmin;