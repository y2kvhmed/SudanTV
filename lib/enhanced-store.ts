import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Content, Category, Genre, Collection, WatchHistory, SearchFilters } from '../types/enhanced';

interface AppState {
  // User state
  user: User | null;
  language: 'en' | 'ar';
  
  // Content state
  content: Content[];
  categories: Category[];
  genres: Genre[];
  collections: Collection[];
  featuredContent: Content[];
  trendingContent: Content[];
  newReleases: Content[];
  
  // User interactions
  favorites: string[];
  watchHistory: WatchHistory[];
  downloads: string[];
  
  // UI state
  isLoading: boolean;
  searchQuery: string;
  searchFilters: SearchFilters;
  currentlyPlaying: Content | null;
  
  // Preferences
  watchPreferences: {
    autoplay: boolean;
    quality: 'auto' | 'low' | 'medium' | 'high' | '4k';
    subtitles: boolean;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setLanguage: (language: 'en' | 'ar') => void;
  setContent: (content: Content[]) => void;
  setCategories: (categories: Category[]) => void;
  setGenres: (genres: Genre[]) => void;
  setCollections: (collections: Collection[]) => void;
  setFeaturedContent: (content: Content[]) => void;
  setTrendingContent: (content: Content[]) => void;
  setNewReleases: (content: Content[]) => void;
  
  // User interactions
  addToFavorites: (contentId: string) => void;
  removeFromFavorites: (contentId: string) => void;
  setFavorites: (favorites: string[]) => void;
  addToWatchHistory: (item: WatchHistory) => void;
  updateWatchProgress: (contentId: string, progress: number, duration?: number) => void;
  setWatchHistory: (history: WatchHistory[]) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  setCurrentlyPlaying: (content: Content | null) => void;
  
  // Preferences
  updateWatchPreferences: (preferences: Partial<AppState['watchPreferences']>) => void;
  
  // Utility actions
  getContentById: (id: string) => Content | undefined;
  getContentByType: (type: string) => Content[];
  getContentByGenre: (genreId: string) => Content[];
  getContinueWatching: () => WatchHistory[];
  getRecommendations: () => Content[];
}

export const useEnhancedStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      language: 'en',
      content: [],
      categories: [],
      genres: [],
      collections: [],
      featuredContent: [],
      trendingContent: [],
      newReleases: [],
      favorites: [],
      watchHistory: [],
      downloads: [],
      isLoading: false,
      searchQuery: '',
      searchFilters: {},
      currentlyPlaying: null,
      watchPreferences: {
        autoplay: true,
        quality: 'auto',
        subtitles: false,
      },

      // Actions
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
      setContent: (content) => set({ content }),
      setCategories: (categories) => set({ categories }),
      setGenres: (genres) => set({ genres }),
      setCollections: (collections) => set({ collections }),
      setFeaturedContent: (featuredContent) => set({ featuredContent }),
      setTrendingContent: (trendingContent) => set({ trendingContent }),
      setNewReleases: (newReleases) => set({ newReleases }),

      // User interactions
      addToFavorites: (contentId) =>
        set((state) => ({
          favorites: [...state.favorites, contentId],
        })),
      removeFromFavorites: (contentId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== contentId),
        })),
      setFavorites: (favorites) => set({ favorites }),

      addToWatchHistory: (item) =>
        set((state) => {
          const existingIndex = state.watchHistory.findIndex(
            (h) => h.content_id === item.content_id && h.episode_id === item.episode_id
          );
          
          if (existingIndex >= 0) {
            const updated = [...state.watchHistory];
            updated[existingIndex] = { ...updated[existingIndex], ...item };
            return { watchHistory: updated };
          } else {
            return { watchHistory: [item, ...state.watchHistory.slice(0, 49)] }; // Keep last 50
          }
        }),

      updateWatchProgress: (contentId, progress, duration) =>
        set((state) => {
          const existingIndex = state.watchHistory.findIndex(
            (h) => h.content_id === contentId
          );
          
          const watchItem: WatchHistory = {
            id: `${contentId}-${Date.now()}`,
            user_id: state.user?.id || '',
            content_id: contentId,
            progress_seconds: progress,
            duration_seconds: duration,
            completed: duration ? progress / duration > 0.9 : false,
            last_watched_at: new Date().toISOString(),
          };

          if (existingIndex >= 0) {
            const updated = [...state.watchHistory];
            updated[existingIndex] = { ...updated[existingIndex], ...watchItem };
            return { watchHistory: updated };
          } else {
            return { watchHistory: [watchItem, ...state.watchHistory.slice(0, 49)] };
          }
        }),

      setWatchHistory: (watchHistory) => set({ watchHistory }),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSearchFilters: (searchFilters) => set({ searchFilters }),
      setCurrentlyPlaying: (currentlyPlaying) => set({ currentlyPlaying }),

      // Preferences
      updateWatchPreferences: (preferences) =>
        set((state) => ({
          watchPreferences: { ...state.watchPreferences, ...preferences },
        })),

      // Utility functions
      getContentById: (id) => {
        const state = get();
        return state.content.find((item) => item.id === id);
      },

      getContentByType: (type) => {
        const state = get();
        return state.content.filter((item) => item.type === type);
      },

      getContentByGenre: (genreId) => {
        const state = get();
        return state.content.filter((item) => 
          item.genre?.some(g => g === genreId)
        );
      },

      getContinueWatching: () => {
        const state = get();
        return state.watchHistory
          .filter((item) => !item.completed && item.progress_seconds > 30)
          .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())
          .slice(0, 10);
      },

      getRecommendations: () => {
        const state = get();
        // Simple recommendation based on watch history and favorites
        const watchedGenres = new Set<string>();
        const favoriteContent = state.content.filter(c => state.favorites.includes(c.id));
        
        favoriteContent.forEach(content => {
          content.genre?.forEach(g => watchedGenres.add(g));
        });

        return state.content
          .filter(content => 
            content.genre?.some(g => watchedGenres.has(g)) &&
            !state.favorites.includes(content.id)
          )
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 20);
      },
    }),
    {
      name: 'sudantv-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        language: state.language,
        favorites: state.favorites,
        watchHistory: state.watchHistory,
        watchPreferences: state.watchPreferences,
      }),
    }
  )
);