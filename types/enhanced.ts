export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  language: 'en' | 'ar';
  subscription_type: 'free' | 'premium' | 'family';
  subscription_expires_at?: string;
  country: string;
  date_of_birth?: string;
  parental_controls: boolean;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  watch_preferences: {
    autoplay: boolean;
    quality: 'auto' | 'low' | 'medium' | 'high' | '4k';
    subtitles: boolean;
  };
  created_at: string;
  last_active_at: string;
}

export interface Content {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  poster_url: string;
  backdrop_url?: string;
  trailer_url?: string;
  video_url: string;
  type: 'movie' | 'series' | 'documentary' | 'youtube' | 'live';
  category_id?: string;
  duration_minutes?: number;
  release_date?: string;
  year: number;
  rating: number;
  rating_count: number;
  imdb_id?: string;
  tmdb_id?: string;
  language: string;
  country: string;
  director?: string;
  cast_members?: string[];
  production_company?: string;
  budget?: number;
  revenue?: number;
  
  // Content flags
  is_featured: boolean;
  is_trending: boolean;
  is_new_release: boolean;
  is_premium: boolean;
  is_kids_friendly: boolean;
  
  // SEO and metadata
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  
  // Analytics
  view_count: number;
  like_count: number;
  share_count: number;
  
  // Relations
  genre?: string[];
  category?: Category;
  
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface Series {
  id: string;
  content_id: string;
  total_seasons: number;
  total_episodes: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  next_episode_date?: string;
  created_at: string;
}

export interface Season {
  id: string;
  series_id: string;
  season_number: number;
  title?: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  poster_url?: string;
  episode_count: number;
  release_date?: string;
  created_at: string;
}

export interface Episode {
  id: string;
  season_id: string;
  episode_number: number;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  thumbnail_url?: string;
  video_url: string;
  duration_minutes?: number;
  air_date?: string;
  view_count: number;
  rating: number;
  is_premium: boolean;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

export interface UserRating {
  id: string;
  user_id: string;
  content_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  content_id: string;
  episode_id?: string;
  progress_seconds: number;
  duration_seconds?: number;
  completed: boolean;
  last_watched_at: string;
  device_info?: any;
}

export interface UserDownload {
  id: string;
  user_id: string;
  content_id: string;
  episode_id?: string;
  download_url: string;
  file_size?: number;
  quality: string;
  expires_at?: string;
  downloaded_at: string;
}

export interface Collection {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  poster_url?: string;
  type: 'curated' | 'auto' | 'user';
  is_featured: boolean;
  sort_order: number;
  created_by?: string;
  created_at: string;
  items?: Content[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  title_ar?: string;
  message: string;
  message_ar?: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  action_url?: string;
  image_url?: string;
  is_read: boolean;
  sent_at: string;
  expires_at?: string;
}

export interface ContentAnalytics {
  id: string;
  content_id: string;
  user_id: string;
  event_type: 'view' | 'play' | 'pause' | 'complete' | 'share' | 'like' | 'download';
  session_id?: string;
  device_info?: any;
  location_info?: any;
  timestamp: string;
}

export interface SearchFilters {
  type?: string[];
  genre?: string[];
  year?: [number, number];
  rating?: [number, number];
  duration?: [number, number];
  language?: string[];
  premium?: boolean;
}

export interface SearchResult {
  content: Content[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}