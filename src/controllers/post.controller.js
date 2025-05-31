// src/controllers/postController.js
import asyncHandler from '../utils/asyncHandler.js';
import {
  createPostService,
  getPostsService,
  getPostByIdService,
  updatePostService,
  deletePostService,
  getPublicPostsService
} from '../services/post.service.js';

/**
 * @route   POST /api/v1/posts
 * @desc    Create a new post
 * @access  Private (admin only)
 */
export const createPost = asyncHandler(async (req, res, next) => {
  const { title, content, status } = req.body;
  const authorId = req.user.id;
  const post = await createPostService({ title, content, status, authorId });
  res.status(201).json({ success: true, data: post });
});

/**
 * @route   GET /api/v1/posts
 * @desc    Get all posts for the logged-in user (author sees own; admin sees all)
 * @access  Private (author, admin)
 */
export const getPosts = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role;
  const posts = await getPostsService({ userId, role });
  res.status(200).json({ success: true, count: posts.length, data: posts });
});

/**
 * @route   GET /api/v1/posts/:id
 * @desc    Get a single post by ID (public if published; otherwise only owner/admin)
 * @access  Public or Private (depending on post.status)
 */
export const getPost = asyncHandler(async (req, res, next) => {
  // Note: If post is published, anyone can view; if draft, only owner/admin can.
  const postId = req.params.id;
  const requestingUser = req.user ? { id: req.user.id, role: req.user.role } : { id: null, role: 'guest' };
  const post = await getPostByIdService({ postId, requestingUser });
  res.status(200).json({ success: true, data: post });
});

/**
 * @route   PUT /api/v1/posts/:id
 * @desc    Update a post (only author or admin)
 * @access  Private (author, admin)
 */
export const updatePost = asyncHandler(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const role = req.user.role;
  const updateFields = req.body;
  const updatedPost = await updatePostService({ postId, userId, role, updateFields });
  res.status(200).json({ success: true, data: updatedPost });
});

/**
 * @route   DELETE /api/v1/posts/:id
 * @desc    Delete a post (only author or admin)
 * @access  Private (author, admin)
 */
export const deletePost = asyncHandler(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const role = req.user.role;
  await deletePostService({ postId, userId, role });
  res.status(200).json({ success: true, data: {} });
});

/**
 * @route   GET /api/v1/posts/public
 * @desc    Get all published posts (public), with pagination & search
 * @access  Public
 */
export const getPublicPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';
  const { posts, page: currentPage, totalPages, total } = await getPublicPostsService({
    page,
    limit,
    search
  });
  res.status(200).json({
    success: true,
    count: posts.length,
    page: currentPage,
    totalPages,
    total,
    data: posts
  });
});
