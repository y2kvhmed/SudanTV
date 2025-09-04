import { create } from 'zustand';
import { User, Content } from '../types';

interface AppState {
  user: User | null;
  language: 'en' | 'ar';
  content: Content[];
  favorites: string[];
  setUser: (user: User | null) => void;
  setLanguage: (language: 'en' | 'ar') => void;
  setContent: (content: Content[]) => void;
  addToFavorites: (contentId: string) => void;
  removeFromFavorites: (contentId: string) => void;
  setFavorites: (favorites: string[]) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  language: 'en',
  content: [],
  favorites: [],
  setUser: (user) => set({ user }),
  setLanguage: (language) => set({ language }),
  setContent: (content) => set({ content }),
  addToFavorites: (contentId) => 
    set((state) => ({ favorites: [...state.favorites, contentId] })),
  removeFromFavorites: (contentId) => 
    set((state) => ({ favorites: state.favorites.filter(id => id !== contentId) })),
  setFavorites: (favorites) => set({ favorites }),
}));