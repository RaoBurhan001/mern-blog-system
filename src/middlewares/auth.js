// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponseHandler.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized, no token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new ErrorResponse('No user found with this id', 404));
    }
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized, token failed', 401));
  }
});

export const authorize = (...roles) => (req, res, next) => {
    console.log("🚀 ~ authorize ~ roles:", req.user)
  if (!req.user) {
    return next(new ErrorResponse('Not authenticated', 401));
  }
  if (!roles.includes(req.user.role)) {
    return next(
      new ErrorResponse(
        `User role (${req.user.role}) is not authorized to access this route`,
        403
      )
    );
  }
  next();
};
