const jwt = require("jsonwebtoken");
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      res.clearCookie('token');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please log in again.'
      });
    }
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({
        success: false,
        error: 'User not found. Please log in again.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Clear invalid token
    res.clearCookie('token');
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

module.exports = authMiddleware;
