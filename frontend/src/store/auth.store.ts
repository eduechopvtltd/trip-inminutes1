// src/store/auth.store.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,

        setAuth: (user, accessToken) =>
          set({ user, accessToken, isAuthenticated: true, isLoading: false }),

        setUser: (user) => set({ user }),

        setAccessToken: (accessToken) => set({ accessToken }),

        setLoading: (isLoading) => set({ isLoading }),

        logout: () =>
          set({ user: null, accessToken: null, isAuthenticated: false }),
      }),
      {
        name: 'tim-auth',
        // Persisting user and token for session persistence across reloads
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          isAuthenticated: state.isAuthenticated
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

// ── Zustand package/UI store
interface UIStore {
  searchTab: 'flights' | 'hotels' | 'packages';
  mobileNavOpen: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot';

  setSearchTab: (tab: UIStore['searchTab']) => void;
  setMobileNavOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean, mode?: UIStore['authModalMode']) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      searchTab: 'flights',
      mobileNavOpen: false,
      authModalOpen: false,
      authModalMode: 'login',

      setSearchTab: (searchTab) => set({ searchTab }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setAuthModalOpen: (authModalOpen, authModalMode = 'login') =>
        set({ authModalOpen, authModalMode }),
    }),
    { name: 'UIStore' },
  ),
);

// ── Wishlist store
interface WishlistStore {
  packageIds: Set<string>;
  setWishlist: (ids: string[]) => void;
  toggle: (packageId: string) => void;
  has: (packageId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      packageIds: new Set<string>(),

      setWishlist: (ids) => set({ packageIds: new Set(ids) }),

      toggle: (packageId) =>
        set((state) => {
          const next = new Set(state.packageIds);
          if (next.has(packageId)) next.delete(packageId);
          else next.add(packageId);
          return { packageIds: next };
        }),

      has: (packageId) => get().packageIds.has(packageId),
    }),
    {
      name: 'tim-wishlist',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str) as { state: { packageIds: string[] } };
          return { state: { ...state, packageIds: new Set(state.packageIds) } };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: { ...value.state, packageIds: [...value.state.packageIds] },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);
