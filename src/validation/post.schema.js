// src/validation/postSchemas.js
import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const getPostParamsSchema = Joi.object({
  id: Joi.string()
    .pattern(objectIdPattern)
    .required()
    .messages({
      'string.pattern.base': 'Invalid post ID',
      'string.empty': 'Post ID is required'
    })
});

export const createPostSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Title is required'
  }),
  content: Joi.string().trim().required().messages({
    'string.empty': 'Content is required'
  }),
  status: Joi.string()
    .valid('draft', 'published')
    .default('draft')
    .messages({
      'any.only': 'Status must be either "draft" or "published"'
    })
});

export const updatePostSchema = Joi.object({
  title: Joi.string().trim().optional().messages({
    'string.empty': 'If provided, title cannot be empty'
  }),
  content: Joi.string().trim().optional().messages({
    'string.empty': 'If provided, content cannot be empty'
  }),
  status: Joi.string().valid('draft', 'published').optional().messages({
    'any.only': 'Status must be either "draft" or "published"'
  })
}).or('title', 'content', 'status'); // at least one field must appear

export const getPublicPostsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  search: Joi.string().trim().allow('').optional()
});
