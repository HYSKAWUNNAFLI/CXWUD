const { PROJECT_MANAGER, TEAM_MEMBER } = require("../config/role");

/**
 * Middleware to authorize users based on their roles
 * @param {Array} roles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    next();
  };
};

module.exports = { authorizeRoles };
