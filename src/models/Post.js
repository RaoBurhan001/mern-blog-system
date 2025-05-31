// src/models/Post.js
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Please add content']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },
    publishedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// + TEXT INDEX for search (title + content)
postSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Post', postSchema);
