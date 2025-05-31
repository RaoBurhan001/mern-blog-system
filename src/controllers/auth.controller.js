// src/controllers/authController.js
import asyncHandler from '../utils/asyncHandler.js';
import { registerUser, loginUser, getCurrentUser } from '../services/auth.service.js';

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body; 
  const { token, user } = await registerUser({ name, email, password, role });
  res.status(201).json({ success: true, token, user });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Log in user
 * @access  Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { token, user } = await loginUser({ email, password });
  res.status(200).json({ success: true, token, user });
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await getCurrentUser(req.user.id);
  res.status(200).json({ success: true, data: user });
});
