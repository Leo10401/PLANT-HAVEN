const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Removed seller role restriction - allow any authenticated user

        // Handle both id and _id fields for backwards compatibility
        if (decoded._id && !decoded.id) {
            decoded.id = decoded._id.toString();
        } else if (decoded.id && !decoded._id) {
            decoded._id = decoded.id.toString();
        }

        // Convert to string for consistent comparison
        if (decoded.id) decoded.id = decoded.id.toString();
        if (decoded._id) decoded._id = decoded._id.toString();

        // Log authentication details for debugging
        console.log('Auth middleware - decoded token:', {
            id: decoded.id,
            _id: decoded._id,
            role: decoded.role,
            email: decoded.email
        });

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            message: 'Invalid token',
            details: error.message 
        });
    }
};

module.exports = auth; 