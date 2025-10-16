import mongoose, { Schema, models } from 'mongoose';

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxLength: 280,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tweet: {
    type: Schema.Types.ObjectId,
    ref: 'Tweet',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = models.Comment || mongoose.model('Comment', CommentSchema);

export default Comment;
