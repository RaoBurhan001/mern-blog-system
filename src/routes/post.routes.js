// src/routes/postRoutes.js
import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getPublicPosts
} from '../controllers/post.controller.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate-request.js';
import {
  createPostSchema,
  updatePostSchema,
  getPostParamsSchema,
  getPublicPostsQuerySchema
} from '../validation/post.schema.js';
import { apiLimiter } from '../middlewares/rate-limiter.js';

const router = express.Router();

router.get(
  '/public',
  validateQuery(getPublicPostsQuerySchema),
  getPublicPosts
);

// Public route: view a single post

// Protect all routes below
router.use(protect);
router.get('/:id',authorize('author', 'admin'), validateParams(getPostParamsSchema), getPost);

// Author & Admin: “Get all posts” (authors only see their own; admin sees all)
router.get('/', authorize('author', 'admin'), getPosts);

router.get('/:id', authorize('author', 'admin') ,validateParams(getPostParamsSchema), getPost);
// Only Admin can CREATE a post
router.post(
  '/',
  authorize('admin','author'),
  apiLimiter,
  validateBody(createPostSchema),
  createPost
);

// Only Admin can UPDATE a post
router.put(
  '/:id',
  authorize('admin'),
  validateParams(getPostParamsSchema),
  validateBody(updatePostSchema),
  updatePost
);

// Only Admin can DELETE a post
router.delete('/:id', authorize('admin'), validateParams(getPostParamsSchema), deletePost);

export default router;
