const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    console.log('verifyToken called, headers:', {
        auth: req.headers['x-auth-token'] ? 'present' : 'missing',
        authorization: req.headers.authorization
    });
    
    // Check for token in both x-auth-token and Authorization header
    let token = req.headers['x-auth-token'] || req.headers.authorization;
    
    // Handle 'Bearer token' format
    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }
    
    console.log('Token after extraction:', token ? 'token present' : 'token missing');
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if(err){
            console.log('Token verification error:', err);
            res.status(403).json({ message: 'Invalid token' });
        } else {
            // Set both user and user.id for compatibility
            req.user = payload;
            req.user.id = payload._id;
            console.log('Token verified successfully, user ID:', payload._id);
            next();
        }
    });
}

module.exports = verifyToken;