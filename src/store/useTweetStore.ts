import { create } from 'zustand';

interface TweetState {
  allTweets: any[];
  followingTweets: any[];
  lastFetchAll: number | null;
  lastFetchFollowing: number | null;
  loading: boolean;
  fetchAllTweets: (userId: string, force?: boolean) => Promise<void>;
  fetchFollowingTweets: (userId: string, force?: boolean) => Promise<void>;
  addTweet: (tweet: any) => void;
  updateTweet: (tweetId: string, updates: any) => void;
  removeTweet: (tweetId: string) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTweetStore = create<TweetState>((set, get) => ({
  allTweets: [],
  followingTweets: [],
  lastFetchAll: null,
  lastFetchFollowing: null,
  loading: false,

  fetchAllTweets: async (userId: string, force = false) => {
    const { lastFetchAll, allTweets } = get();
    const now = Date.now();

    // Return cached data if it's still fresh and not forced
    if (!force && lastFetchAll && now - lastFetchAll < CACHE_DURATION && allTweets.length > 0) {
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch(`/api/tweets?userId=${userId}&feedType=all`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        set({ 
          allTweets: data, 
          lastFetchAll: now,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching all tweets:', error);
      set({ loading: false });
    }
  },

  fetchFollowingTweets: async (userId: string, force = false) => {
    const { lastFetchFollowing, followingTweets } = get();
    const now = Date.now();

    // Return cached data if it's still fresh and not forced
    if (!force && lastFetchFollowing && now - lastFetchFollowing < CACHE_DURATION && followingTweets.length > 0) {
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch(`/api/tweets?userId=${userId}&feedType=following`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        set({ 
          followingTweets: data, 
          lastFetchFollowing: now,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching following tweets:', error);
      set({ loading: false });
    }
  },

  addTweet: (tweet: any) => {
    set((state) => ({
      allTweets: [tweet, ...state.allTweets],
      followingTweets: [tweet, ...state.followingTweets],
    }));
  },

  updateTweet: (tweetId: string, updates: any) => {
    set((state) => ({
      allTweets: state.allTweets.map(t => 
        t._id === tweetId ? { ...t, ...updates } : t
      ),
      followingTweets: state.followingTweets.map(t => 
        t._id === tweetId ? { ...t, ...updates } : t
      ),
    }));
  },

  removeTweet: (tweetId: string) => {
    set((state) => ({
      allTweets: state.allTweets.filter(t => t._id !== tweetId),
      followingTweets: state.followingTweets.filter(t => t._id !== tweetId),
    }));
  },
}));
