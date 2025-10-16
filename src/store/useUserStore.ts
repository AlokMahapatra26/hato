import { create } from 'zustand';

interface UserCache {
  data: any;
  timestamp: number;
}

interface UserState {
  users: Record<string, UserCache>;
  loading: Record<string, boolean>;
  fetchUser: (userId: string, force?: boolean) => Promise<any>;
  updateUser: (userId: string, updates: any) => void;
  clearUser: (userId: string) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>((set, get) => ({
  users: {},
  loading: {},

  fetchUser: async (userId: string, force = false) => {
    const { users, loading } = get();
    const now = Date.now();

    // Return cached data if it's still fresh
    const cached = users[userId];
    if (!force && cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // Avoid duplicate requests
    if (loading[userId]) {
      return null;
    }

    set((state) => ({
      loading: { ...state.loading, [userId]: true },
    }));

    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      
      if (res.ok) {
        set((state) => ({
          users: {
            ...state.users,
            [userId]: { data, timestamp: now },
          },
          loading: { ...state.loading, [userId]: false },
        }));
        return data;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }

    set((state) => ({
      loading: { ...state.loading, [userId]: false },
    }));
    return null;
  },

  updateUser: (userId: string, updates: any) => {
    set((state) => {
      const cached = state.users[userId];
      if (!cached) return state;

      return {
        users: {
          ...state.users,
          [userId]: {
            data: { ...cached.data, ...updates },
            timestamp: cached.timestamp,
          },
        },
      };
    });
  },

  clearUser: (userId: string) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.users;
      return { users: rest };
    });
  },
}));
