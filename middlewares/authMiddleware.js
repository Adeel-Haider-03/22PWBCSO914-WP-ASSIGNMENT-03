// middleware/authMiddleware.js

const authMiddleware = (req, res, next) => {
    // No token check, allow all requests
    next();
  };
  
  module.exports = authMiddleware;
  