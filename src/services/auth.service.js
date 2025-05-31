// src/services/authService.js
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponseHandler.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Register a new user. 
 * - Hashes password with bcrypt.
 * - Returns a JWT on success.
 */
export const registerUser = async ({ name, email, password, role }) => {
  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse('Email already in use', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  return createTokenResponse(user);
};

/**
 * Log in a user:
 * - Verify email/password.
 * - Return JWT on success.
 */
export const loginUser = async ({ email, password }) => {
    console.log("🚀 ~ loginUser ~ email:", email, "password:", password)
  const user = await User.findOne({ email }).select('+password');
  console.log("🚀 ~ loginUser ~ user:", user)
  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  return createTokenResponse(user);
};

/**
 * Create token payload and return { token, user } 
 */
const createTokenResponse = (user) => {
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

/**
 * Fetch current user by ID (used in GET /auth/me).
 */
export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new ErrorResponse('No user found with this id', 404);
  }
  return user;
};
