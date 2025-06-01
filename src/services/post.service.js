// src/services/postService.js
import Post from '../models/Post.js';
import ErrorResponse from '../utils/errorResponseHandler.js';

/**
 * Create a new post, setting req.user._id as author.
 */
export const createPostService = async ({ title, content, status, authorId }) => {
  const post = await Post.create({
    title,
    content,
    status,
    author: authorId,
    publishedAt: status === 'published' ? Date.now() : null
  });
  return post;
};

/**
 * Get posts for a user:
 * - If role === 'author', only fetch their posts.
 * - If role === 'admin', fetch all posts.
 */
export const getPostsService = async ({ userId, role }) => {
  let query = {};
  if (role === 'author') {
    query.author = userId;
  }
  const posts = await Post.find(query).populate({ path: 'author', select: 'name email' });
  return posts;
};

/**
 * Get a single post by ID.
 * If status is 'draft', ensure only owner or admin can retrieve.
 */
export const getPostByIdService = async ({ postId, requestingUser }) => {
  const post = await Post.findById(postId).populate({ path: 'author', select: 'name email role' });
  if (!post) {
    throw new ErrorResponse(`No post found with id ${postId}`, 404);
  }

  if (post.status === 'draft') {
    // Only owner or admin can view drafts
    if (
      requestingUser.role !== 'admin' &&
      post.author._id.toString() !== requestingUser.id
    ) {
      throw new ErrorResponse('Not authorized to view this post', 403);
    }
  }

  return post;
};

/**
 * Update a post:
 * - Only author (own post) or admin can update.
 * - If status changes to 'published' from 'draft', set publishedAt.
 */
export const updatePostService = async ({ postId, userId, role, updateFields }) => {
  let post = await Post.findById(postId);
  if (!post) {
    throw new ErrorResponse(`No post found with id ${postId}`, 404);
  }

  if (post.author.toString() !== userId && role !== 'admin') {
    throw new ErrorResponse('Not authorized to update this post', 403);
  }

  // If changing from draft → published
  if (updateFields.status === 'published' && post.status !== 'published') {
    updateFields.publishedAt = Date.now();
  }

  post = await Post.findByIdAndUpdate(postId, updateFields, {
    new: true,
    runValidators: true
  });

  return post;
};

/**
 * Delete a post:
 * - Only author or admin can delete.
 */
export const deletePostService = async ({ postId, userId, role }) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new ErrorResponse(`No post found with id ${postId}`, 404);
  }
  if (post.author.toString() !== userId && role !== 'admin') {
    throw new ErrorResponse('Not authorized to delete this post', 403);
  }
  await post.deleteOne();
  return;
};

/**
 * Get all published posts (public), with pagination and optional search.
 */
export const getPublicPostsService = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;
  const queryObj = { status: 'published' };
  if (search) {
    queryObj.$text = { $search: search };
  }

  const total = await Post.countDocuments(queryObj);
  const posts = await Post.find(queryObj)
    .skip(skip)
    .limit(limit)
    .sort({ publishedAt: -1 })
    .populate({ path: 'author', select: 'name' });

  return {
    posts,
    page,
    totalPages: Math.ceil(total / limit),
    total
  };
};
