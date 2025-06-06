// src/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,                 
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
