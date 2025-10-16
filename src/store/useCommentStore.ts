import { create } from 'zustand';

interface CommentCache {
  comments: any[];
  timestamp: number;
}

interface CommentState {
  commentsByTweet: Record<string, CommentCache>;
  loading: Record<string, boolean>;
  fetchComments: (tweetId: string, force?: boolean) => Promise<void>;
  addComment: (tweetId: string, comment: any) => void;
  removeComment: (tweetId: string, commentId: string) => void;
  getCommentCount: (tweetId: string) => number;
}

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export const useCommentStore = create<CommentState>((set, get) => ({
  commentsByTweet: {},
  loading: {},

  fetchComments: async (tweetId: string, force = false) => {
    const { commentsByTweet, loading } = get();
    const now = Date.now();

    // Return cached data if it's still fresh
    const cached = commentsByTweet[tweetId];
    if (!force && cached && now - cached.timestamp < CACHE_DURATION) {
      return;
    }

    // Avoid duplicate requests
    if (loading[tweetId]) {
      return;
    }

    set((state) => ({
      loading: { ...state.loading, [tweetId]: true },
    }));

    try {
      const res = await fetch(`/api/comments?tweetId=${tweetId}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        set((state) => ({
          commentsByTweet: {
            ...state.commentsByTweet,
            [tweetId]: { comments: data, timestamp: now },
          },
          loading: { ...state.loading, [tweetId]: false },
        }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      set((state) => ({
        loading: { ...state.loading, [tweetId]: false },
      }));
    }
  },

  addComment: (tweetId: string, comment: any) => {
    set((state) => {
      const cached = state.commentsByTweet[tweetId];
      const comments = cached ? cached.comments : [];
      
      return {
        commentsByTweet: {
          ...state.commentsByTweet,
          [tweetId]: {
            comments: [comment, ...comments],
            timestamp: Date.now(),
          },
        },
      };
    });
  },

  removeComment: (tweetId: string, commentId: string) => {
    set((state) => {
      const cached = state.commentsByTweet[tweetId];
      if (!cached) return state;

      return {
        commentsByTweet: {
          ...state.commentsByTweet,
          [tweetId]: {
            comments: cached.comments.filter(c => c._id !== commentId),
            timestamp: cached.timestamp,
          },
        },
      };
    });
  },

  getCommentCount: (tweetId: string) => {
    const cached = get().commentsByTweet[tweetId];
    return cached ? cached.comments.length : 0;
  },
}));
