import mongoose, { Schema, models } from 'mongoose';

const FollowSchema = new Schema({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = models.Follow || mongoose.model('Follow', FollowSchema);

export default Follow;
