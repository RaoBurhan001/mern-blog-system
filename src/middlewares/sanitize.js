// src/middlewares/sanitize.js
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';

export const sanitizeRequest = [
  (req, res, next) => {
    if (typeof req.body !== 'object' || req.body === null) req.body = {};
    if (typeof req.query !== 'object' || req.query === null) req.query = {};
    if (typeof req.params !== 'object' || req.params === null) req.params = {};
    next();
  },
  mongoSanitize(),
  xssClean()
];
