import { create } from 'zustand';

interface CelebrityState {
  rankings: any[];
  followingStates: Record<string, boolean>;
  lastFetch: number | null;
  loading: boolean;
  fetchRankings: (force?: boolean) => Promise<void>;
  updateFollowState: (userId: string, isFollowing: boolean) => void;
  checkFollowStatuses: (userId: string, users: any[]) => Promise<void>;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (rankings don't change as frequently)

export const useCelebrityStore = create<CelebrityState>((set, get) => ({
  rankings: [],
  followingStates: {},
  lastFetch: null,
  loading: false,

  fetchRankings: async (force = false) => {
    const { lastFetch, rankings } = get();
    const now = Date.now();

    // Return cached data if it's still fresh and not forced
    if (!force && lastFetch && now - lastFetch < CACHE_DURATION && rankings.length > 0) {
      return;
    }

    set({ loading: true });
    try {
      const res = await fetch('/api/celebrity');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        set({ 
          rankings: data, 
          lastFetch: now,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
      set({ loading: false });
    }
  },

  checkFollowStatuses: async (userId: string, users: any[]) => {
    try {
      const statuses: Record<string, boolean> = {};
      
      // Batch check follow statuses
      const checks = users
        .filter(user => user._id !== userId)
        .map(async (user) => {
          const res = await fetch(
            `/api/follow?followerId=${userId}&followingId=${user._id}`
          );
          const data = await res.json();
          statuses[user._id] = data.isFollowing;
        });
      
      await Promise.all(checks);
      
      set({ followingStates: statuses });
    } catch (error) {
      console.error('Error checking follow statuses:', error);
    }
  },

  updateFollowState: (userId: string, isFollowing: boolean) => {
    set((state) => ({
      followingStates: {
        ...state.followingStates,
        [userId]: isFollowing,
      },
    }));
  },
}));
