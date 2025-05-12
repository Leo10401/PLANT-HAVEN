const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // Check for token in both x-auth-token and Authorization header
    const token = req.headers['x-auth-token'] || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if(err){
            console.log(err);
            res.status(403).json({ message: 'Invalid token' });
        } else {
            // Set both user and user.id for compatibility
            req.user = payload;
            req.user.id = payload._id;
            next();
        }
    });
}

module.exports = verifyToken;