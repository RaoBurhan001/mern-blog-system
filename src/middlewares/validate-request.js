// src/middlewares/validateRequest.js
import Joi from 'joi';
import ErrorResponse from '../utils/errorResponseHandler.js';


export const validateBody = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    Object.assign(req.body, value);
    next();
  };
  
  export const validateParams = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    Object.assign(req.params, value);
    next();
  };
  
  export const validateQuery = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    Object.assign(req.query, value);
    next();
  };
  