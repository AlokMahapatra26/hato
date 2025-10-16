import mongoose, { Schema, models } from 'mongoose';

const TweetSchema = new Schema({
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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tweet = models.Tweet || mongoose.model('Tweet', TweetSchema);

export default Tweet;
