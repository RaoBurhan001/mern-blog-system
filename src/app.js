// src/app.js
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import connectDB from './config/db.js';
import errorHandler from './middlewares/error.js';
import { apiLimiter } from './middlewares/rate-limiter.js';
import { sanitizeRequest } from './middlewares/sanitize.js';

// Route files
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Use Helmet to set secure HTTP headers
app.use(helmet());

// and add apiLimiter to specific routes.
app.use(apiLimiter);

// Body parser
app.use(express.json());

// Sanitize data (against NoSQL injection & XSS)
// app.use(sanitizeRequest);

// Enable CORS (adjust origin in production!)
app.use(cors());

// Health check/test endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);



// Global error handler
app.use(errorHandler);

export default app;
