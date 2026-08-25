// middleware/requireRole.js
const AppError = require('../utils/AppError');

module.exports = (...roles) => {
  return (req, res, next) => {
    // Ensure req.user exists (set by requireAuth) and has an allowed role
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Access denied', 403));
    }
    next();
  };
};