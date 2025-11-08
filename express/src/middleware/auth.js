import User from '../models/user.js';

// Check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({
    success: false,
    error: 'Please log in to access this resource'
  });
};

// Check if user is authenticated and get user details
export const requireAuth = async (req, res, next) => {
  try {
    if (req.session && req.session.user) {
      const user = await User.findById(req.session.user.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      req.user = user;
      return next();
    }
    
    return res.status(401).json({
      success: false,
      error: 'Please log in to access this resource'
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    });
  }
};

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: 'Admin access required'
  });
};