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

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, payload) => {
        if(err){
            console.log('Token verification error:', err);
            res.status(403).json({ message: 'Invalid token' });
        } else {
            // Set user data from payload
            req.user = payload;
            
            // Handle both id and _id fields for backwards compatibility
            // Make sure both are always available
            if (payload.id && !payload._id) {
                req.user._id = payload.id;
            } else if (payload._id && !payload.id) {
                req.user.id = payload._id;
            }
            
            // Convert to string for consistent comparison
            if (req.user.id) req.user.id = req.user.id.toString();
            if (req.user._id) req.user._id = req.user._id.toString();
            
            console.log('Token verified successfully:', { 
                id: req.user.id,
                _id: req.user._id,
                role: req.user.role
            });
            
            next();
        }
    });
}

module.exports = verifyToken;